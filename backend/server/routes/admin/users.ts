import { Router } from "express";
import { z } from "zod";
import { eq, ilike, sql, count, and, ne } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import { users, activityLog } from "../../db/schema/users.js";
import { requireRole } from "../../middleware/auth.js";
import { sendWelcomeEmail } from "../../services/email.js";

const router = Router();

router.use(requireRole("admin"));

function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, (ch) => `\\${ch}`);
}

/** Generates a cryptographically secure temporary password */
function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(200).optional(),
});

/** GET /api/admin/users — list all users with pagination and search */
router.get("/", async (req, res) => {
  try {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Érvénytelen lekérdezési paraméterek." });
    }

    const { page, limit, search } = query.data;
    const offset = (page - 1) * limit;

    const safeSearch = search ? escapeLikePattern(search) : null;
    const whereClause = safeSearch
      ? sql`(${ilike(users.email, `%${safeSearch}%`)} OR ${ilike(users.name, `%${safeSearch}%`)})`
      : undefined;

    const [userList, [{ total }]] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          active: users.active,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(sql`${users.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users).where(whereClause),
    ]);

    res.json({
      users: userList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[admin/users] List error:", error);
    res.status(500).json({ error: "Hiba történt a felhasználók lekérdezésekor." });
  }
});

const createUserSchema = z.object({
  email: z.string().email("Érvénytelen email cím.").max(320),
  name: z.string().min(1, "A név megadása kötelező.").max(255),
  role: z.enum(["admin", "editor", "viewer"]),
});

/** POST /api/admin/users — create a new user with temp password and send welcome email */
router.post("/", async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Érvénytelen adatok.",
        details: result.error.flatten().fieldErrors,
      });
    }

    const { email, name, role } = result.data;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Ez az email cím már regisztrálva van." });
    }

    const tempPassword = generateTempPassword();

    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name,
        role,
        passwordHash,
        active: true,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        active: users.active,
        createdAt: users.createdAt,
      });

    const adminUser = req.user;
    if (adminUser) {
      await db.insert(activityLog).values({
        userId: adminUser.id,
        action: "user_created",
        details: { message: `Új felhasználó létrehozva: ${email} (${role})` },
        entityType: "user",
        entityId: newUser.id,
      });
    }

    const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
    const loginUrl = `${siteUrl}/admin/login`;

    try {
      await sendWelcomeEmail({ email: email.toLowerCase(), tempPassword, loginUrl });
    } catch (emailError) {
      console.error("[admin/users] Welcome email failed:", emailError);
      // User was created but email failed — continue and report
    }

    res.status(201).json({
      user: newUser,
      message: "Felhasználó sikeresen létrehozva.",
    });
  } catch (error) {
    console.error("[admin/users] Create error:", error);
    res.status(500).json({ error: "Hiba történt a felhasználó létrehozásakor." });
  }
});

const changeEmailSchema = z.object({
  email: z.string().email("Érvénytelen email cím."),
  emailConfirm: z.string().email("Érvénytelen email cím."),
});

/** PATCH /api/admin/users/me/email — change the current user's email address */
router.patch("/me/email", async (req, res) => {
  try {
    const parsed = changeEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email, emailConfirm } = parsed.data;

    if (email.toLowerCase() !== emailConfirm.toLowerCase()) {
      return res.status(400).json({ error: "Az email címek nem egyeznek." });
    }

    const normalizedEmail = email.toLowerCase();
    const currentUser = req.user!;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, normalizedEmail), ne(users.id, currentUser.id)))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Ez az email cím már használatban van." });
    }

    await db
      .update(users)
      .set({ email: normalizedEmail, updatedAt: new Date() })
      .where(eq(users.id, currentUser.id));

    await db.insert(activityLog).values({
      userId: currentUser.id,
      action: "email_changed",
      entityType: "user",
      entityId: currentUser.id,
    });

    res.json({
      user: { id: currentUser.id, email: normalizedEmail, name: currentUser.name, role: currentUser.role },
      message: "Email cím sikeresen módosítva.",
    });
  } catch (error) {
    console.error("[admin/users] Change email error:", error);
    res.status(500).json({ error: "Szerverhiba az email cím módosítása során." });
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A jelenlegi jelszó megadása kötelező."),
  newPassword: z.string().min(8, "Az új jelszónak legalább 8 karakter hosszúnak kell lennie."),
  newPasswordConfirm: z.string().min(1, "Az új jelszó megerősítése kötelező."),
});

/** PATCH /api/admin/users/me/password — change the current user's password */
router.patch("/me/password", async (req, res) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { currentPassword, newPassword, newPasswordConfirm } = parsed.data;

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ error: "Az új jelszavak nem egyeznek." });
    }

    const currentUser = req.user!;

    const [freshUser] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, currentUser.id))
      .limit(1);

    if (!freshUser || !await bcrypt.compare(currentPassword, freshUser.passwordHash)) {
      return res.status(401).json({ error: "A jelenlegi jelszó helytelen." });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, currentUser.id));

    await db.insert(activityLog).values({
      userId: currentUser.id,
      action: "password_changed",
      entityType: "user",
      entityId: currentUser.id,
    });

    res.json({ success: true, message: "Jelszó sikeresen módosítva." });
  } catch (error) {
    console.error("[admin/users] Change password error:", error);
    res.status(500).json({ error: "Szerverhiba a jelszó módosítása során." });
  }
});

const updateUserSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]).optional(),
  active: z.boolean().optional(),
  name: z.string().min(1).max(255).optional(),
});

/** PATCH /api/admin/users/:id — update user role, status, or name */
router.patch("/:id", async (req, res) => {
  try {
    const idResult = z.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen felhasználó azonosító." });
    }

    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Érvénytelen adatok.",
        details: result.error.flatten().fieldErrors,
      });
    }

    const updates = result.data;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Nincs módosítandó adat." });
    }

    // Prevent self-deactivation
    const adminUser = req.user;
    if (adminUser && adminUser.id === idResult.data && updates.active === false) {
      return res.status(400).json({ error: "Nem deaktiválhatja saját fiókját." });
    }

    // Prevent demoting yourself from admin
    if (adminUser && adminUser.id === idResult.data && updates.role && updates.role !== "admin") {
      return res.status(400).json({ error: "Nem módosíthatja saját szerepkörét." });
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, idResult.data))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        active: users.active,
        updatedAt: users.updatedAt,
      });

    if (!updated) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }

    if (adminUser) {
      const changes: string[] = [];
      if (updates.role) changes.push(`szerepkör: ${updates.role}`);
      if (updates.active !== undefined) changes.push(updates.active ? "aktiválva" : "deaktiválva");
      if (updates.name) changes.push(`név: ${updates.name}`);

      await db.insert(activityLog).values({
        userId: adminUser.id,
        action: "user_updated",
        details: { message: `Felhasználó módosítva (${updated.email}): ${changes.join(", ")}` },
        entityType: "user",
        entityId: updated.id,
      });
    }

    res.json({
      user: updated,
      message: "Felhasználó sikeresen módosítva.",
    });
  } catch (error) {
    console.error("[admin/users] Update error:", error);
    res.status(500).json({ error: "Hiba történt a felhasználó módosításakor." });
  }
});

/** DELETE /api/admin/users/:id — permanently delete a user */
router.delete("/:id", async (req, res) => {
  try {
    const idResult = z.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen felhasználó azonosító." });
    }

    // Prevent self-deletion
    const adminUser = req.user;
    if (adminUser && adminUser.id === idResult.data) {
      return res.status(400).json({ error: "Nem törölheti saját fiókját." });
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, idResult.data))
      .returning({ id: users.id, email: users.email });

    if (!deleted) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }

    if (adminUser) {
      await db.insert(activityLog).values({
        userId: adminUser.id,
        action: "user_deleted",
        details: { message: `Felhasználó törölve: ${deleted.email}` },
        entityType: "user",
        entityId: deleted.id,
      });
    }

    res.json({
      success: true,
      message: "Felhasználó sikeresen törölve.",
    });
  } catch (error) {
    console.error("[admin/users] Delete error:", error);
    res.status(500).json({ error: "Hiba történt a felhasználó törlésekor." });
  }
});

export default router;
