import express from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { generateChatResponse } from "../services/gemini-chat";
import { validateChatInput, logSuspiciousInput, checkDailyBudget, recordTokenUsage } from "../utils/chat-security";
import { db } from "../db/index";
import { aiLeads } from "../db/schema/agent";
import { sendEmail } from "../services/email";
import { leadNotificationSubject, leadNotificationHtml, leadNotificationText } from "../templates/lead_notification";

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.CHAT_RATE_LIMIT_PER_HOUR) || 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    reply: "Túl sok kérdést tett fel ma. Kérem próbálja újra később, vagy keresse irodánkat: +36 70 613 2658",
  },
});

router.post("/chat", chatLimiter, async (req, res) => {
  const { propertyId, currentPath, userMessage, conversationHistory } = req.body;

  const validation = validateChatInput(userMessage, propertyId);
  if (!validation.valid) {
    return res.status(400).json({ reply: validation.error });
  }

  const sanitizedPath = typeof currentPath === "string" && /^\/[a-zA-Z0-9/_-]{0,200}$/.test(currentPath)
    ? currentPath
    : undefined;

  const budgetOk = await checkDailyBudget();
  if (!budgetOk) {
    return res.status(503).json({
      reply: "A mai napra a chat szolgáltatás elérhetősége korlátozott. Kérem keresse irodánkat: +36 70 613 2658",
    });
  }

  logSuspiciousInput(userMessage, req.ip || "unknown");

  const trimmedHistory = (conversationHistory || []).slice(-10);

  try {
    const result = await generateChatResponse({
      propertyId: propertyId || undefined,
      currentPath: sanitizedPath,
      userMessage,
      conversationHistory: trimmedHistory,
    });

    await recordTokenUsage(result.tokensUsed);

    res.json({
      reply: result.reply,
      sources: result.sources,
    });
  } catch (err) {
    console.error(JSON.stringify({
      level: "error",
      ts: new Date().toISOString(),
      module: "chat-route",
      error: err instanceof Error ? err.message : String(err),
    }));
    res.status(500).json({
      reply: "Sajnálom, technikai hiba történt. Kérem próbálja újra később, vagy keresse irodánkat: +36 70 613 2658",
    });
  }
});

const HUNGARIAN_PHONE_REGEX = /^(\+36|06)\d{8,9}$/;

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Túl sok kérés. Kérjük, próbálja újra később." },
});

router.post("/chat/lead", leadLimiter, async (req, res) => {
  const { phone, name, propertyId, sessionId, summary, currentPath } = req.body;

  if (typeof phone !== "string" || !HUNGARIAN_PHONE_REGEX.test(phone.replace(/[\s-]/g, ""))) {
    return res.status(400).json({ error: "Érvénytelen telefonszám. Kérjük, magyar formátumban adja meg (+36 vagy 06 előtaggal)." });
  }

  const cleanPhone = phone.replace(/[\s-]/g, "");
  const ipHash = crypto.createHash("sha256").update(req.ip || "unknown").digest("hex");

  const sanitizedPath = typeof currentPath === "string" && /^\/[a-zA-Z0-9/_-]{0,200}$/.test(currentPath)
    ? currentPath
    : null;

  try {
    const [lead] = await db.insert(aiLeads).values({
      phone: cleanPhone,
      name: typeof name === "string" && name.trim() ? name.trim().slice(0, 255) : null,
      propertyId: typeof propertyId === "string" && propertyId ? propertyId : null,
      sessionId: typeof sessionId === "string" && sessionId ? sessionId : null,
      conversationSummary: typeof summary === "string" && summary ? summary.slice(0, 5000) : null,
      currentPath: sanitizedPath,
      ipHash,
    }).returning({ id: aiLeads.id });

    const now = new Date();
    try {
      await sendEmail({
        to: "info@gerecseingatlan.hu",
        subject: leadNotificationSubject({ phone: cleanPhone, propertyId, createdAt: now }),
        html: leadNotificationHtml({ phone: cleanPhone, name, propertyId, conversationSummary: summary, currentPath: sanitizedPath, createdAt: now }),
        text: leadNotificationText({ phone: cleanPhone, name, propertyId, conversationSummary: summary, currentPath: sanitizedPath, createdAt: now }),
      });
    } catch (emailErr) {
      console.error(JSON.stringify({
        level: "error",
        ts: new Date().toISOString(),
        module: "chat-lead",
        event: "notification_email_failed",
        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
        leadId: lead?.id,
      }));
    }

    res.json({ success: true });
  } catch (err) {
    console.error(JSON.stringify({
      level: "error",
      ts: new Date().toISOString(),
      module: "chat-lead",
      event: "lead_insert_failed",
      error: err instanceof Error ? err.message : String(err),
    }));
    res.status(500).json({ error: "Hiba történt. Kérjük, próbálja újra később." });
  }
});

export default router;
