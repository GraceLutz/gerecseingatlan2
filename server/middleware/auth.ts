import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { sessions, users, type User } from "../db/schema/users.js";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

const SESSION_COOKIE = "sid";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createSession(userId: string, res: Response): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const [session] = await db
    .insert(sessions)
    .values({ userId, expiresAt })
    .returning();

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS,
    path: "/",
  });

  return session.id;
}

export async function destroySession(sessionId: string, res: Response): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = parseCookie(req.headers.cookie || "", SESSION_COOKIE);
  if (!sessionId) {
    res.status(401).json({ error: "Nincs bejelentkezve." });
    return;
  }

  const result = await db
    .select()
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (result.length === 0) {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.status(401).json({ error: "A munkamenet lejárt." });
    return;
  }

  const { users: user } = result[0];
  if (!user.active) {
    res.status(403).json({ error: "A fiók inaktív." });
    return;
  }

  req.user = user;
  req.sessionId = sessionId;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Nincs bejelentkezve." });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Nincs jogosultsága ehhez a művelethez." });
      return;
    }
    next();
  };
}

function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// CSRF token utilities
const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(res: Response): string {
  const token = crypto.randomBytes(32).toString("hex");
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // JS must read this
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS,
  });
  return token;
}

export function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = parseCookie(req.headers.cookie || "", CSRF_COOKIE);
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (
    !cookieToken ||
    !headerToken ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    res.status(403).json({ error: "Érvénytelen CSRF token." });
    return;
  }
  next();
}
