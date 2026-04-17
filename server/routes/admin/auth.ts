import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import { users, activityLog } from "../../db/schema/users.js";
import { eq } from "drizzle-orm";
import { createSession, destroySession, requireAuth, generateCsrfToken } from "../../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("Érvénytelen email cím."),
  password: z.string().min(1, "A jelszó megadása kötelező."),
});

router.post("/login", async (req, res) => {
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
});

router.post("/logout", requireAuth, async (req, res) => {
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
});

router.get("/me", requireAuth, (req, res) => {
  const user = req.user!;
  const csrfToken = generateCsrfToken(res);
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    csrfToken,
  });
});

export default router;
