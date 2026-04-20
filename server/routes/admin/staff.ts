import { Router } from "express";
import { z } from "zod";
import { eq, sql, count, ilike, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { db } from "../../db/index";
import { staff } from "../../db/schema/staff";
import { activityLog, users } from "../../db/schema/users";
import { requireRole } from "../../middleware/auth";
import { sendWelcomeEmail } from "../../services/email";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../../uploads/staff");

const router = Router();

router.use(requireRole("admin", "editor"));

const PHONE_PATTERN = /^[+]?[\d\s\-()]{6,20}$/;

const phoneSchema = z
  .string()
  .max(50)
  .refine((v) => !v || PHONE_PATTERN.test(v), {
    message: "Érvénytelen telefonszám formátum.",
  })
  .optional()
  .nullable();

const createStaffSchema = z.object({
  name: z.string().min(1, "A név megadása kötelező.").max(255),
  email: z.string().email("Érvénytelen e-mail cím.").max(320).optional().nullable(),
  phone: phoneSchema,
  roleTitle: z.string().max(255).default("Ingatlanközvetítő"),
  bio: z.string().max(5000).optional().nullable(),
  active: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  showPhone: z.boolean().default(true),
  focalPointX: z.number().int().min(0).max(100).default(50),
  focalPointY: z.number().int().min(0).max(100).default(25),
  dashboardAccess: z.boolean().default(false),
});

const updateStaffSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email("Érvénytelen e-mail cím.").max(320).optional().nullable(),
  phone: phoneSchema,
  roleTitle: z.string().max(255).optional(),
  bio: z.string().max(5000).optional().nullable(),
  active: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  focalPointX: z.number().int().min(0).max(100).optional(),
  focalPointY: z.number().int().min(0).max(100).optional(),
});

const idSchema = z.string().uuid("Érvénytelen azonosító.");

function escapeLikePattern(s: string): string {
  return s.replace(/[%_\\]/g, (c) => `\\${c}`);
}

/** GET /api/admin/staff — list all staff */
router.get("/", async (req, res) => {
  try {
    const querySchema = z.object({
      search: z.string().max(200).optional(),
      active: z.enum(["true", "false"]).optional(),
    });

    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Érvénytelen lekérdezési paraméterek." });
    }

    const conditions = [];
    if (query.data.search) {
      const pattern = `%${escapeLikePattern(query.data.search)}%`;
      conditions.push(
        sql`(${ilike(staff.name, pattern)} OR ${ilike(staff.email, pattern)})`
      );
    }
    if (query.data.active !== undefined) {
      conditions.push(eq(staff.active, query.data.active === "true"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [members, [{ total }]] = await Promise.all([
      db
        .select()
        .from(staff)
        .where(whereClause)
        .orderBy(sql`${staff.name} ASC`),
      db.select({ total: count() }).from(staff).where(whereClause),
    ]);

    res.json({ staff: members, total });
  } catch (error) {
    console.error("[admin/staff] List error:", error);
    res.status(500).json({ error: "Hiba történt a munkatársak lekérdezésekor." });
  }
});

/** GET /api/admin/staff/:id — get single staff member */
router.get("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [member] = await db
      .select()
      .from(staff)
      .where(eq(staff.id, idResult.data))
      .limit(1);

    if (!member) {
      return res.status(404).json({ error: "Munkatárs nem található." });
    }

    res.json(member);
  } catch (error) {
    console.error("[admin/staff] Get error:", error);
    res.status(500).json({ error: "Hiba történt a munkatárs lekérdezésekor." });
  }
});

/** POST /api/admin/staff — create staff member */
router.post("/", async (req, res) => {
  try {
    const result = createStaffSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "Érvénytelen adatok.",
      });
    }

    const { dashboardAccess, ...staffData } = result.data;

    if (staffData.email) {
      const existingStaff = await db
        .select({ id: staff.id })
        .from(staff)
        .where(eq(staff.email, staffData.email.toLowerCase()))
        .limit(1);

      if (existingStaff.length > 0) {
        return res.status(409).json({ error: "Ez az e-mail cím már egy másik munkatárshoz tartozik." });
      }
    }

    let userId: string | null = null;

    if (dashboardAccess && staffData.email) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, staffData.email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({ error: "Ez az e-mail cím már regisztrálva van felhasználóként." });
      }

      const tempPassword = randomBytes(12).toString("base64url");
      const passwordHash = await hash(tempPassword, 12);

      const [newUser] = await db
        .insert(users)
        .values({
          email: staffData.email,
          passwordHash,
          name: staffData.name,
          role: "editor" as const,
        })
        .returning();

      userId = newUser.id;

      const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
      const loginUrl = `${siteUrl}/admin/login`;
      await sendWelcomeEmail({
        email: staffData.email,
        tempPassword,
        loginUrl,
      });
    }

    const [member] = await db
      .insert(staff)
      .values({
        ...staffData,
        userId,
      })
      .returning();

    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "staff_created",
      entityType: "staff",
      entityId: member.id,
      details: { name: member.name, roleTitle: member.roleTitle },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error("[admin/staff] Create error:", error);
    res.status(500).json({ error: "Hiba történt a munkatárs létrehozásakor." });
  }
});

/** PATCH /api/admin/staff/:id — update staff member */
router.patch("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const result = updateStaffSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "Érvénytelen adatok.",
      });
    }

    const [updated] = await db
      .update(staff)
      .set(result.data)
      .where(eq(staff.id, idResult.data))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Munkatárs nem található." });
    }

    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "staff_updated",
      entityType: "staff",
      entityId: updated.id,
      details: { name: updated.name, changes: Object.keys(result.data) },
    });

    res.json(updated);
  } catch (error) {
    console.error("[admin/staff] Update error:", error);
    res.status(500).json({ error: "Hiba történt a munkatárs módosításakor." });
  }
});

/** DELETE /api/admin/staff/:id — delete staff member */
router.delete("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [deleted] = await db
      .delete(staff)
      .where(eq(staff.id, idResult.data))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Munkatárs nem található." });
    }

    // Clean up photo file if exists — validate path stays within UPLOAD_DIR
    if (deleted.photoUrl) {
      const photoPath = path.resolve(__dirname, "../../..", deleted.photoUrl);
      if (photoPath.startsWith(UPLOAD_DIR)) {
        fs.unlink(photoPath, () => {});
      }
    }

    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "staff_deleted",
      entityType: "staff",
      entityId: deleted.id,
      details: { name: deleted.name },
    });

    res.json({
      success: true,
      message: "Munkatárs sikeresen törölve.",
    });
  } catch (error) {
    console.error("[admin/staff] Delete error:", error);
    res.status(500).json({ error: "Hiba történt a munkatárs törlésekor." });
  }
});

/** Detect image format from file magic bytes. Returns null for unrecognized formats. */
function detectImageFormat(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;

  // JPEG: starts with FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) {
    return { ext: ".png", mime: "image/png" };
  }

  // WebP: starts with RIFF....WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { ext: ".webp", mime: "image/webp" };
  }

  return null;
}

/** POST /api/admin/staff/:id/photo — upload staff photo */
router.post("/:id/photo", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [member] = await db
      .select()
      .from(staff)
      .where(eq(staff.id, idResult.data))
      .limit(1);

    if (!member) {
      return res.status(404).json({ error: "Munkatárs nem található." });
    }

    const contentType = req.headers["content-type"] ?? "";
    if (!contentType.startsWith("image/")) {
      return res.status(400).json({ error: "Csak képfájl tölthető fel." });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: "Nem támogatott képformátum. Használjon JPEG, PNG vagy WebP formátumot." });
    }

    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });

    const chunks: Buffer[] = [];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    let totalSize = 0;

    req.on("data", (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > MAX_SIZE) {
        res.status(413).json({ error: "A fájl mérete nem haladhatja meg az 5 MB-ot." });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", async () => {
      if (res.headersSent) return;

      const buffer = Buffer.concat(chunks);

      const detected = detectImageFormat(buffer);
      if (!detected) {
        return res.status(400).json({ error: "A fájl tartalma nem felismerhető képformátum. Használjon JPEG, PNG vagy WebP formátumot." });
      }

      const filename = `${idResult.data}${detected.ext}`;
      const filePath = path.join(UPLOAD_DIR, filename);
      await fs.promises.writeFile(filePath, buffer);

      // Delete old photo if different format — validate path stays within UPLOAD_DIR
      if (member.photoUrl) {
        const oldPath = path.resolve(__dirname, "../../..", member.photoUrl);
        if (oldPath !== filePath && oldPath.startsWith(UPLOAD_DIR)) {
          fs.unlink(oldPath, () => {});
        }
      }

      const photoUrl = `/uploads/staff/${filename}`;
      const [updated] = await db
        .update(staff)
        .set({ photoUrl })
        .where(eq(staff.id, idResult.data))
        .returning();

      res.json({ photoUrl: updated.photoUrl });
    });

    req.on("error", () => {
      res.status(500).json({ error: "Hiba történt a fájl feltöltésekor." });
    });
  } catch (error) {
    console.error("[admin/staff] Photo upload error:", error);
    res.status(500).json({ error: "Hiba történt a kép feltöltésekor." });
  }
});

export default router;
