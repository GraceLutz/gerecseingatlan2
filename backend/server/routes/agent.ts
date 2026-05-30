import { Router } from "express";
import { db } from "../db/index.js";
import { chatSessions, chatMessages } from "../db/schema/agent.js";
import { eq, and, desc, asc, isNull, inArray } from "drizzle-orm";
import { processMessage, type AgentRequest, type AgentResponse } from "../services/agent.js";
import { logApiUsage, isBudgetExhausted } from "../services/cost-tracker.js";
import { agentRateLimit } from "../middleware/agent-rate-limit.js";

const router = Router();

const BUDGET_EXHAUSTED_MSG =
  "A szolgáltatás átmenetileg nem elérhető, kérjük próbálja később.";

/**
 * POST /api/agent/chat
 *
 * Body: { sessionId: string, propertyId?: string, message: string, history?: Array<{ role, content }> }
 * Returns: { reply, citations, suggestions, costEstimate }
 */
router.post("/chat", agentRateLimit, async (req, res) => {
  const { sessionId, propertyId, message, history } = req.body;

  // Input validation
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Hiányzó vagy érvénytelen sessionId." });
  }

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Hiányzó üzenet." });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: "Az üzenet túl hosszú (max 2000 karakter)." });
  }

  if (propertyId !== undefined && typeof propertyId !== "string") {
    return res.status(400).json({ error: "Érvénytelen propertyId." });
  }

  if (history !== undefined) {
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: "Érvénytelen history." });
    }
    const validRoles = new Set(["user", "assistant"]);
    for (const item of history) {
      if (
        typeof item !== "object" ||
        item === null ||
        !validRoles.has(item.role) ||
        typeof item.content !== "string"
      ) {
        return res.status(400).json({ error: "Érvénytelen history elem: role (user/assistant) és content (string) szükséges." });
      }
    }
  }

  // Budget check (hard kill switch)
  try {
    if (await isBudgetExhausted()) {
      return res.status(503).json({ error: BUDGET_EXHAUSTED_MSG });
    }
  } catch (err) {
    console.error("[agent/chat] Budget check failed:", err);
  }

  try {
    // Find or create chat session
    let chatSession = await findOrCreateSession(sessionId, propertyId ?? null);

    // Store user message
    await db.insert(chatMessages).values({
      sessionId: chatSession.id,
      role: "user",
      content: message,
    });

    // Call the AI agent
    const agentRequest: AgentRequest = {
      sessionId,
      propertyId: propertyId ?? undefined,
      message,
      history: history ?? undefined,
    };

    const agentResponse: AgentResponse = await processMessage(agentRequest);

    // Store assistant response
    await db.insert(chatMessages).values({
      sessionId: chatSession.id,
      role: "assistant",
      content: agentResponse.reply,
      tokensUsed: agentResponse.tokensUsed,
    });

    // Update session metadata
    await db
      .update(chatSessions)
      .set({
        lastMessageAt: new Date(),
        messageCount: chatSession.messageCount + 2,
      })
      .where(eq(chatSessions.id, chatSession.id));

    // Log API usage (non-blocking)
    logApiUsage({
      service: "gemini",
      endpoint: "generateContent",
      tokensOrUnits: agentResponse.tokensUsed,
      estimatedCostUsd: agentResponse.estimatedCostUsd.toFixed(6),
      userSessionId: sessionId,
      propertyId: propertyId ?? undefined,
    }).catch((err) => {
      console.error("[agent/chat] Usage logging failed:", err);
    });

    res.json({
      reply: agentResponse.reply,
      citations: agentResponse.citations,
      suggestions: agentResponse.suggestions,
      costEstimate: agentResponse.estimatedCostUsd,
    });
  } catch (err) {
    console.error("[agent/chat] Error:", err);
    res.status(500).json({
      error: "Hiba történt a kérdés feldolgozása során. Kérjük, próbálja újra.",
    });
  }
});

/**
 * GET /api/agent/sessions/:sessionId/messages
 *
 * Returns chat message history for a given session, ordered by created_at ASC.
 */
router.get("/sessions/:sessionId/messages", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Hiányzó vagy érvénytelen sessionId." });
  }

  try {
    const sessions = await db
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(eq(chatSessions.userSessionId, sessionId))
      .orderBy(desc(chatSessions.lastMessageAt));

    if (sessions.length === 0) {
      return res.status(404).json({ error: "A munkamenet nem található." });
    }

    const sessionIds = sessions.map((s) => s.id);

    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        toolCalls: chatMessages.toolCalls,
        tokensUsed: chatMessages.tokensUsed,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(inArray(chatMessages.sessionId, sessionIds))
      .orderBy(asc(chatMessages.createdAt));

    res.json(messages);
  } catch (err) {
    console.error("[agent/sessions/messages] Error:", err);
    res.status(500).json({ error: "Hiba történt az üzenetek lekérdezése során." });
  }
});

async function findOrCreateSession(
  userSessionId: string,
  propertyId: string | null,
) {
  // Look for an existing session for this user+property combo from the last 24h
  const oneDayAgo = new Date(Date.now() - 86_400_000);

  const existing = await db
    .select()
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.userSessionId, userSessionId),
        propertyId
          ? eq(chatSessions.propertyId, propertyId)
          : isNull(chatSessions.propertyId),
      ),
    )
    .orderBy(desc(chatSessions.lastMessageAt))
    .limit(1);

  if (existing.length > 0 && existing[0].lastMessageAt >= oneDayAgo) {
    return existing[0];
  }

  // Create new session
  const [newSession] = await db
    .insert(chatSessions)
    .values({
      userSessionId,
      propertyId,
    })
    .returning();

  return newSession;
}

export default router;
