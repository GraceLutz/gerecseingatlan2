import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { chatMessages, chatSessions } from "../db/schema/agent.js";
import { sql, and, gte, eq } from "drizzle-orm";

const RATE_LIMIT_PER_HOUR = parseInt(process.env.AGENT_RATE_LIMIT_PER_HOUR || "20", 10);
const RATE_LIMIT_PER_DAY_SESSION = 50;
const RATE_LIMIT_PER_DAY_IP = 100;

const RATE_LIMIT_MSG = "Túl sok kérdés. Kérjük, próbálja újra később.";
const RATE_LIMIT_HOUR_MSG = `Óránként legfeljebb ${RATE_LIMIT_PER_HOUR} kérdést tehet fel. Kérjük, próbálja újra később.`;
const RATE_LIMIT_DAY_MSG = "Elérte a napi kérdéskorlátot. Kérjük, próbálja holnap újra.";

// In-memory IP tracking (cleared hourly to prevent unbounded growth)
const ipHourCounts = new Map<string, { count: number; resetAt: number }>();
const ipDayCounts = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipHourCounts) {
    if (val.resetAt <= now) ipHourCounts.delete(key);
  }
  for (const [key, val] of ipDayCounts) {
    if (val.resetAt <= now) ipDayCounts.delete(key);
  }
}, 60_000);

function getClientIp(req: Request): string {
  return req.ip || "unknown";
}

/**
 * Rate limiting middleware for the agent chat endpoint.
 * Enforces per-IP limits in-memory and per-session limits via DB.
 */
export async function agentRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const ip = getClientIp(req);
  const sessionId = req.body?.sessionId as string | undefined;
  const now = Date.now();

  // Per-IP hourly check (in-memory, fast)
  const hourEntry = ipHourCounts.get(ip);
  if (hourEntry && hourEntry.resetAt > now) {
    if (hourEntry.count >= RATE_LIMIT_PER_HOUR) {
      res.status(429).json({ error: RATE_LIMIT_HOUR_MSG });
      return;
    }
    hourEntry.count++;
  } else {
    ipHourCounts.set(ip, { count: 1, resetAt: now + 3_600_000 });
  }

  // Per-IP daily check (in-memory, fast)
  const dayEntry = ipDayCounts.get(ip);
  if (dayEntry && dayEntry.resetAt > now) {
    if (dayEntry.count >= RATE_LIMIT_PER_DAY_IP) {
      res.status(429).json({ error: RATE_LIMIT_DAY_MSG });
      return;
    }
    dayEntry.count++;
  } else {
    ipDayCounts.set(ip, { count: 1, resetAt: now + 86_400_000 });
  }

  // Per-session daily check via DB (only if sessionId provided)
  if (sessionId) {
    try {
      const oneDayAgo = new Date(now - 86_400_000);
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(chatMessages)
        .innerJoin(chatSessions, eq(chatMessages.sessionId, chatSessions.id))
        .where(
          and(
            eq(chatSessions.userSessionId, sessionId),
            eq(chatMessages.role, "user"),
            gte(chatMessages.createdAt, oneDayAgo),
          ),
        );

      const messageCount = Number(result[0]?.count || 0);
      if (messageCount >= RATE_LIMIT_PER_DAY_SESSION) {
        res.status(429).json({ error: RATE_LIMIT_DAY_MSG });
        return;
      }
    } catch (err) {
      // DB error should not block the request — log and continue
      console.error("[agent-rate-limit] DB check failed:", err);
    }
  }

  next();
}
