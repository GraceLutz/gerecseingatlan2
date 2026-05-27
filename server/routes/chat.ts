import express from "express";
import rateLimit from "express-rate-limit";
import { generateChatResponse } from "../services/gemini-chat";
import { validateChatInput, logSuspiciousInput, checkDailyBudget, recordTokenUsage } from "../utils/chat-security";

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

export default router;
