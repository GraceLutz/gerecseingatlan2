import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import { users, activityLog } from "../../db/schema/users.js";
import { eq, and, ne } from "drizzle-orm";
import { createSession, destroySession, requireAuth, generateCsrfToken } from "../../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("Érvénytelen email cím."),
  password: z.string().min(1, "A jelszó megadása kötelező."),
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: "Hibás email cím vagy jelszó." });
    }

    if (!user.active) {
      return res.status(403).json({ error: "A fiók inaktív. Forduljon az adminisztrátorhoz." });
    }

    await createSession(user.id, res);
    const csrfToken = generateCsrfToken(res);

    await db.insert(activityLog).values({
      userId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id,
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      csrfToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Szerverhiba a bejelentkezés során." });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    if (req.user && req.sessionId) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        action: "logout",
        entityType: "user",
        entityId: req.user.id,
      });
      await destroySession(req.sessionId, res);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Szerverhiba a kijelentkezés során." });
  }
});

router.get("/me", requireAuth, (req, res) => {
  const user = req.user!;
  const csrfToken = generateCsrfToken(res);
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    csrfToken,
  });
});

const changeEmailSchema = z.object({
  email: z.string().email("Érvénytelen email cím."),
  emailConfirm: z.string().email("Érvénytelen email cím."),
});

router.patch("/me/email", requireAuth, async (req, res) => {
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
    console.error("Change email error:", error);
    res.status(500).json({ error: "Szerverhiba az email cím módosítása során." });
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A jelenlegi jelszó megadása kötelező."),
  newPassword: z.string().min(8, "Az új jelszónak legalább 8 karakter hosszúnak kell lennie."),
  newPasswordConfirm: z.string().min(1, "Az új jelszó megerősítése kötelező."),
});

router.patch("/me/password", requireAuth, async (req, res) => {
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
    console.error("Change password error:", error);
    res.status(500).json({ error: "Szerverhiba a jelszó módosítása során." });
  }
});

export default router;
