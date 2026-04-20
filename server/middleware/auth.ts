/**
 * Authentication and CSRF middleware for the Express server.
 *
 * Provides cookie-based session management (24 h TTL) backed by the
 * `sessions` table, role-based access control, and double-submit-cookie
 * CSRF protection using timing-safe comparison.
 *
 * @module server/middleware/auth
 */

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

/**
 * Creates a new authenticated session for the given user.
 * Inserts a row into the `sessions` table and sets an HTTP-only session cookie.
 *
 * @param userId - The ID of the user to create a session for.
 * @param res - Express response used to set the session cookie.
 * @returns The newly created session ID.
 */
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

/**
 * Destroys an active session by deleting it from the database and clearing the cookie.
 *
 * @param sessionId - The session ID to invalidate.
 * @param res - Express response used to clear the session cookie.
 */
export async function destroySession(sessionId: string, res: Response): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

/**
 * Express middleware that requires a valid, non-expired session.
 * On success, attaches `req.user` and `req.sessionId`. On failure, responds
 * with 401 (no/expired session) or 403 (inactive account).
 */
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

/**
 * Returns Express middleware that restricts access to users with one of the specified roles.
 * Must be used after {@link requireAuth} so `req.user` is populated.
 *
 * @param roles - Allowed role names (e.g. "admin", "agent").
 * @returns Middleware that responds 401/403 if the user lacks the required role.
 */
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

/**
 * Extracts a single cookie value from a raw `Cookie` header string.
 *
 * @param cookieHeader - The raw `Cookie` header value.
 * @param name - The cookie name to look up.
 * @returns The decoded cookie value, or `undefined` if not found.
 */
function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Validates an invite token from the URL, loads the associated user record,
 * and attaches it to `req.user`. Used for the accept-invite/set-password flow.
 * Responds with 400/404 if the token is missing, invalid, or already used.
 *
 * Requires `inviteToken` and `inviteStatus` columns on the users table.
 * If the schema hasn't been migrated yet, returns 503.
 */
export async function validateInviteToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.params.token || req.body?.token;
  if (!token || typeof token !== "string" || token.length < 32) {
    res.status(400).json({ error: "Érvénytelen meghívó link." });
    return;
  }

  // Schema fields added by migration — guard against pre-migration usage
  const usersTable = users as any;
  if (!usersTable.inviteToken || !usersTable.inviteStatus) {
    res.status(503).json({ error: "A meghívó funkció még nincs aktiválva." });
    return;
  }

  const result = await db
    .select()
    .from(users)
    .where(
      and(
        eq(usersTable.inviteToken, token),
        eq(usersTable.inviteStatus, "pending"),
      ),
    )
    .limit(1);

  if (result.length === 0) {
    res.status(404).json({ error: "A meghívó link érvénytelen vagy már felhasználták." });
    return;
  }

  req.user = result[0];
  next();
}

// CSRF token utilities
const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generates a cryptographically random CSRF token and sets it as a
 * non-HTTP-only cookie so client-side JavaScript can read and echo it
 * back in the {@link CSRF_HEADER} header.
 *
 * @param res - Express response used to set the CSRF cookie.
 * @returns The generated CSRF token string.
 */
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

/**
 * Express middleware that validates the double-submit-cookie CSRF token.
 * Skips safe HTTP methods (GET, HEAD, OPTIONS). Compares the cookie token
 * against the `x-csrf-token` request header using timing-safe comparison.
 */
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
