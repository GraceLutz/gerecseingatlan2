import { Router } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index";
import { newsletterSubscribers } from "../db/schema/newsletter";
import { sendNewsletterConfirmationEmail } from "../services/email";

const router = Router();

const subscribeSchema = z.object({
  email: z.string().email("Érvénytelen e-mail cím.").max(320),
  name: z.string().max(255).optional(),
  gdprConsent: z.literal(true, {
    errorMap: () => ({
      message: "Az adatkezelési hozzájárulás kötelező.",
    }),
  }),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** POST /api/newsletter/subscribe */
router.post("/subscribe", async (req, res) => {
  try {
    const result = subscribeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "Érvénytelen adatok.",
      });
    }

    const { email, name } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      const sub = existing[0];
      if (sub.status === "confirmed") {
        return res.json({
          success: true,
          message: "Ez az e-mail cím már fel van iratkozva.",
        });
      }
      if (sub.status === "pending") {
        return res.json({
          success: true,
          message:
            "Már kaptál megerősítő e-mailt. Kérjük, ellenőrizd a postaládádat.",
        });
      }
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      null;
    const userAgent = (req.headers["user-agent"] as string) ?? null;

    const [subscriber] = await db
      .insert(newsletterSubscribers)
      .values({
        email: normalizedEmail,
        name: name ?? null,
        status: "pending",
        ipAddress,
        userAgent,
      })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: {
          name: name ?? null,
          status: "pending" as const,
          ipAddress,
          userAgent,
          updatedAt: new Date(),
        },
      })
      .returning();

    const confirmUrl = `${process.env.SITE_URL ?? "https://gerecseingatlan.hu"}/api/newsletter/confirm/${subscriber.confirmationToken}`;

    await sendNewsletterConfirmationEmail({
      email: normalizedEmail,
      confirmUrl,
      name: name ?? undefined,
    });

    res.json({
      success: true,
      message:
        "Sikeres feliratkozás! Kérjük, erősítse meg e-mail címét a kapott levélben.",
    });
  } catch (error) {
    console.error("[newsletter/subscribe] Error:", error);
    res.status(500).json({ error: "Hiba történt a feliratkozás során." });
  }
});

/** GET /api/newsletter/confirm/:token */
router.get("/confirm/:token", async (req, res) => {
  try {
    const tokenSchema = z.string().uuid();
    const tokenResult = tokenSchema.safeParse(req.params.token);
    if (!tokenResult.success) {
      return res.status(400).send(confirmationPage(false, "Érvénytelen megerősítő link."));
    }

    const [subscriber] = await db
      .update(newsletterSubscribers)
      .set({
        status: "confirmed",
        confirmedAt: new Date(),
        confirmationToken: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(newsletterSubscribers.confirmationToken, tokenResult.data),
          eq(newsletterSubscribers.status, "pending")
        )
      )
      .returning();

    if (!subscriber) {
      return res.status(404).send(confirmationPage(false, "A megerősítő link érvénytelen vagy már felhasználták."));
    }

    res.send(confirmationPage(true, "Sikeresen megerősítette feliratkozását!"));
  } catch (error) {
    console.error("[newsletter/confirm] Error:", error);
    res.status(500).send(confirmationPage(false, "Hiba történt a megerősítés során."));
  }
});

/** POST /api/newsletter/unsubscribe */
router.post("/unsubscribe", async (req, res) => {
  try {
    const schema = z.object({ email: z.string().email().max(320) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Érvénytelen e-mail cím." });
    }

    const normalizedEmail = result.data.email.toLowerCase().trim();

    const [updated] = await db
      .update(newsletterSubscribers)
      .set({
        status: "unsubscribed",
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscribers.email, normalizedEmail))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Ez az e-mail cím nem található." });
    }

    res.json({
      success: true,
      message: "Sikeresen leiratkozott a hírlevélről.",
    });
  } catch (error) {
    console.error("[newsletter/unsubscribe] Error:", error);
    res.status(500).json({ error: "Hiba történt a leiratkozás során." });
  }
});

function confirmationPage(success: boolean, message: string): string {
  const bgColor = success ? "#E8F5E9" : "#FFEBEE";
  const textColor = success ? "#2E7D32" : "#C62828";
  return `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${success ? "Megerősítve" : "Hiba"} – Gerecse Ingatlan</title></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#F5F3EF;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:480px;margin:32px auto;padding:48px 32px;background-color:#FFFFFF;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C5A55A;font-weight:bold;margin-bottom:24px;">G<span style="color:#1B3A5C;">I</span></div>
    <div style="padding:16px;margin-bottom:24px;background-color:${bgColor};border-radius:8px;">
      <p style="font-size:16px;color:${textColor};margin:0;font-weight:bold;">${escapeHtml(message)}</p>
    </div>
    <a href="/" style="display:inline-block;padding:12px 32px;background-color:#1B3A5C;color:#FFFFFF;text-decoration:none;font-weight:bold;border-radius:4px;">Vissza a főoldalra</a>
  </div>
</body>
</html>`;
}

export default router;
