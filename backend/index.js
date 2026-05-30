import{createRequire}from'module';const require=createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import dotenv2 from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit3 from "express-rate-limit";

// server/routes/admin/auth.ts
import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";

// server/db/index.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// server/db/schema/users.ts
var users_exports = {};
__export(users_exports, {
  activityLog: () => activityLog,
  sessions: () => sessions,
  userRoleEnum: () => userRoleEnum,
  users: () => users
});
import { pgTable, uuid, varchar, boolean, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
var userRoleEnum = pgEnum("user_role", ["admin", "editor", "viewer"]);
var users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: userRoleEnum("role").notNull().default("viewer"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
var sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index("sessions_expires_at_idx").on(table.expiresAt)
]);
var activityLog = pgTable("activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id", { length: 255 }),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// server/db/schema/content.ts
var content_exports = {};
__export(content_exports, {
  contentBlockVersions: () => contentBlockVersions,
  contentBlocks: () => contentBlocks
});
import {
  pgTable as pgTable2,
  uuid as uuid2,
  text as text2,
  varchar as varchar2,
  timestamp as timestamp2,
  uniqueIndex,
  integer
} from "drizzle-orm/pg-core";
var contentBlocks = pgTable2(
  "content_blocks",
  {
    id: uuid2("id").defaultRandom().primaryKey(),
    pagePath: varchar2("page_path", { length: 255 }).notNull(),
    blockKey: varchar2("block_key", { length: 255 }).notNull(),
    content: text2("content").notNull().default(""),
    contentType: varchar2("content_type", { length: 20 }).notNull().default("text"),
    updatedAt: timestamp2("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()),
    updatedBy: uuid2("updated_by").references(() => users.id, {
      onDelete: "set null"
    }),
    createdAt: timestamp2("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("content_blocks_page_block_idx").on(
      table.pagePath,
      table.blockKey
    )
  ]
);
var contentBlockVersions = pgTable2("content_block_versions", {
  id: uuid2("id").defaultRandom().primaryKey(),
  blockId: uuid2("block_id").notNull().references(() => contentBlocks.id, { onDelete: "cascade" }),
  content: text2("content").notNull(),
  contentType: varchar2("content_type", { length: 20 }).notNull(),
  version: integer("version").notNull(),
  editedBy: uuid2("edited_by").references(() => users.id, {
    onDelete: "set null"
  }),
  createdAt: timestamp2("created_at", { withTimezone: true }).notNull().defaultNow()
});

// server/db/schema/newsletter.ts
var newsletter_exports = {};
__export(newsletter_exports, {
  campaignStatusEnum: () => campaignStatusEnum,
  newsletterCampaigns: () => newsletterCampaigns,
  newsletterSubscribers: () => newsletterSubscribers,
  subscriberStatusEnum: () => subscriberStatusEnum
});
import {
  pgTable as pgTable3,
  pgEnum as pgEnum2,
  uuid as uuid3,
  varchar as varchar3,
  timestamp as timestamp3,
  text as text3,
  integer as integer2,
  uniqueIndex as uniqueIndex2
} from "drizzle-orm/pg-core";
var subscriberStatusEnum = pgEnum2("subscriber_status", [
  "pending",
  "confirmed",
  "unsubscribed"
]);
var newsletterSubscribers = pgTable3(
  "newsletter_subscribers",
  {
    id: uuid3("id").defaultRandom().primaryKey(),
    email: varchar3("email", { length: 320 }).notNull(),
    name: varchar3("name", { length: 255 }),
    status: subscriberStatusEnum("status").notNull().default("pending"),
    confirmationToken: uuid3("confirmation_token").defaultRandom(),
    confirmedAt: timestamp3("confirmed_at", { withTimezone: true }),
    subscribedAt: timestamp3("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp3("unsubscribed_at", { withTimezone: true }),
    ipAddress: varchar3("ip_address", { length: 45 }),
    userAgent: text3("user_agent"),
    createdAt: timestamp3("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp3("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => [uniqueIndex2("newsletter_subscribers_email_idx").on(table.email)]
);
var campaignStatusEnum = pgEnum2("campaign_status", [
  "draft",
  "sent"
]);
var newsletterCampaigns = pgTable3("newsletter_campaigns", {
  id: uuid3("id").defaultRandom().primaryKey(),
  subject: varchar3("subject", { length: 500 }).notNull(),
  preheader: varchar3("preheader", { length: 255 }),
  body: text3("body").notNull(),
  status: campaignStatusEnum("campaign_status").notNull().default("draft"),
  sentAt: timestamp3("sent_at", { withTimezone: true }),
  sentBy: uuid3("sent_by"),
  recipientCount: integer2("recipient_count").default(0),
  createdAt: timestamp3("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp3("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
});

// server/db/schema/staff.ts
var staff_exports = {};
__export(staff_exports, {
  staff: () => staff
});
import {
  pgTable as pgTable4,
  uuid as uuid4,
  varchar as varchar4,
  text as text4,
  boolean as boolean2,
  timestamp as timestamp4,
  index as index2,
  integer as integer3
} from "drizzle-orm/pg-core";
var staff = pgTable4("staff", {
  id: uuid4("id").defaultRandom().primaryKey(),
  name: varchar4("name", { length: 255 }).notNull(),
  email: varchar4("email", { length: 320 }),
  phone: varchar4("phone", { length: 50 }),
  roleTitle: varchar4("role_title", { length: 255 }).notNull().default("Ingatlank\xF6zvet\xEDt\u0151"),
  photoUrl: text4("photo_url"),
  bio: text4("bio"),
  active: boolean2("active").notNull().default(true),
  showEmail: boolean2("show_email").notNull().default(true),
  showPhone: boolean2("show_phone").notNull().default(true),
  sortOrder: integer3("sort_order").notNull().default(0),
  focalPointX: integer3("focal_point_x").notNull().default(50),
  focalPointY: integer3("focal_point_y").notNull().default(25),
  userId: uuid4("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp4("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp4("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
}, (table) => [
  index2("staff_user_id_idx").on(table.userId)
]);

// server/db/schema/calendar.ts
var calendar_exports = {};
__export(calendar_exports, {
  calendarEvents: () => calendarEvents,
  eventInvitees: () => eventInvitees,
  eventTypeEnum: () => eventTypeEnum
});
import {
  pgTable as pgTable5,
  pgEnum as pgEnum3,
  uuid as uuid5,
  varchar as varchar5,
  text as text5,
  timestamp as timestamp5,
  index as index3
} from "drizzle-orm/pg-core";
var eventTypeEnum = pgEnum3("event_type", [
  "ingatlan_megtekintes",
  "ugyfel_talalkozo",
  "belso_megbeszeles",
  "szabadsag",
  "egyeb"
]);
var calendarEvents = pgTable5("calendar_events", {
  id: uuid5("id").defaultRandom().primaryKey(),
  title: varchar5("title", { length: 255 }).notNull(),
  description: text5("description"),
  startDatetime: timestamp5("start_datetime", { withTimezone: true }).notNull(),
  endDatetime: timestamp5("end_datetime", { withTimezone: true }).notNull(),
  staffId: uuid5("staff_id").references(() => staff.id, { onDelete: "cascade" }),
  createdBy: uuid5("created_by").references(() => users.id, { onDelete: "set null" }),
  eventType: eventTypeEnum("event_type").notNull().default("egyeb"),
  location: varchar5("location", { length: 500 }),
  propertyId: text5("property_id"),
  color: varchar5("color", { length: 7 }),
  createdAt: timestamp5("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp5("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
}, (table) => [
  index3("calendar_events_staff_id_idx").on(table.staffId),
  index3("calendar_events_start_datetime_idx").on(table.startDatetime)
]);
var eventInvitees = pgTable5("event_invitees", {
  id: uuid5("id").defaultRandom().primaryKey(),
  eventId: uuid5("event_id").notNull().references(() => calendarEvents.id, { onDelete: "cascade" }),
  staffId: uuid5("staff_id").references(() => staff.id, { onDelete: "cascade" }),
  email: varchar5("email", { length: 320 }).notNull(),
  notifiedAt: timestamp5("notified_at", { withTimezone: true }),
  createdAt: timestamp5("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index3("event_invitees_event_id_idx").on(table.eventId),
  index3("event_invitees_staff_id_idx").on(table.staffId)
]);

// server/db/schema/featured.ts
var featured_exports = {};
__export(featured_exports, {
  featuredProperties: () => featuredProperties
});
import {
  pgTable as pgTable6,
  uuid as uuid6,
  varchar as varchar6,
  boolean as boolean3,
  timestamp as timestamp6,
  integer as integer4,
  index as index4
} from "drizzle-orm/pg-core";
var featuredProperties = pgTable6("featured_properties", {
  id: uuid6("id").defaultRandom().primaryKey(),
  propertyId: varchar6("property_id", { length: 255 }).notNull().unique(),
  isFeatured: boolean3("is_featured").notNull().default(true),
  featuredAt: timestamp6("featured_at", { withTimezone: true }).notNull().defaultNow(),
  featuredOrder: integer4("featured_order").default(0),
  featuredBy: uuid6("featured_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp6("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp6("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
}, (table) => [
  index4("featured_properties_property_id_idx").on(table.propertyId),
  index4("featured_properties_featured_order_idx").on(table.isFeatured, table.featuredOrder)
]);

// server/db/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check .env.local");
}
console.log("[db] Connecting with:", process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@"));
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 2e4,
  connectionTimeoutMillis: 3e4,
  ssl: { rejectUnauthorized: false }
});
pool.on("error", (err) => {
  console.error("[db] Idle client error (will reconnect on next query):", err.message);
});
var db = drizzle(pool, {
  schema: { ...users_exports, ...content_exports, ...newsletter_exports, ...staff_exports, ...calendar_exports, ...featured_exports }
});

// server/routes/admin/auth.ts
import { eq as eq2, and as and2, ne } from "drizzle-orm";

// server/middleware/auth.ts
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
var SESSION_COOKIE = "sid";
var SESSION_DURATION_MS = 24 * 60 * 60 * 1e3;
async function createSession(userId, res) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const [session] = await db.insert(sessions).values({ userId, expiresAt }).returning();
  const isProduction2 = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: isProduction2,
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS,
    path: "/"
  });
  return session.id;
}
async function destroySession(sessionId, res) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}
async function requireAuth(req, res, next) {
  const sessionId = parseCookie(req.headers.cookie || "", SESSION_COOKIE);
  if (!sessionId) {
    res.status(401).json({ error: "Nincs bejelentkezve." });
    return;
  }
  const result = await db.select().from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, /* @__PURE__ */ new Date()))).limit(1);
  if (result.length === 0) {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.status(401).json({ error: "A munkamenet lej\xE1rt." });
    return;
  }
  const { users: user } = result[0];
  if (!user.active) {
    res.status(403).json({ error: "A fi\xF3k inakt\xEDv." });
    return;
  }
  req.user = user;
  req.sessionId = sessionId;
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Nincs bejelentkezve." });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Nincs jogosults\xE1ga ehhez a m\u0171velethez." });
      return;
    }
    next();
  };
}
function parseCookie(cookieHeader, name) {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : void 0;
}
var CSRF_COOKIE = "csrf_token";
var CSRF_HEADER = "x-csrf-token";
function generateCsrfToken(res) {
  const token = crypto.randomBytes(32).toString("hex");
  const isProduction2 = process.env.NODE_ENV === "production";
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    // JS must read this
    secure: isProduction2,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS
  });
  return token;
}
function validateCsrf(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  const cookieToken = parseCookie(req.headers.cookie || "", CSRF_COOKIE);
  const headerToken = req.headers[CSRF_HEADER];
  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length || !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    res.status(403).json({ error: "\xC9rv\xE9nytelen CSRF token." });
    return;
  }
  next();
}

// server/routes/admin/auth.ts
var router = Router();
var loginSchema = z.object({
  email: z.string().email("\xC9rv\xE9nytelen email c\xEDm."),
  password: z.string().min(1, "A jelsz\xF3 megad\xE1sa k\xF6telez\u0151.")
});
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { email, password } = parsed.data;
    const [user] = await db.select().from(users).where(eq2(users.email, email.toLowerCase())).limit(1);
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: "Hib\xE1s email c\xEDm vagy jelsz\xF3." });
    }
    if (!user.active) {
      return res.status(403).json({ error: "A fi\xF3k inakt\xEDv. Forduljon az adminisztr\xE1torhoz." });
    }
    await createSession(user.id, res);
    const csrfToken = generateCsrfToken(res);
    await db.insert(activityLog).values({
      userId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id
    });
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      csrfToken
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Szerverhiba a bejelentkez\xE9s sor\xE1n." });
  }
});
router.post("/logout", requireAuth, async (req, res) => {
  try {
    if (req.user && req.sessionId) {
      await db.insert(activityLog).values({
        userId: req.user.id,
        action: "logout",
        entityType: "user",
        entityId: req.user.id
      });
      await destroySession(req.sessionId, res);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Szerverhiba a kijelentkez\xE9s sor\xE1n." });
  }
});
router.get("/me", requireAuth, (req, res) => {
  const user = req.user;
  const csrfToken = generateCsrfToken(res);
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    csrfToken
  });
});
var changeEmailSchema = z.object({
  email: z.string().email("\xC9rv\xE9nytelen email c\xEDm."),
  emailConfirm: z.string().email("\xC9rv\xE9nytelen email c\xEDm.")
});
router.patch("/me/email", requireAuth, async (req, res) => {
  try {
    const parsed = changeEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { email, emailConfirm } = parsed.data;
    if (email.toLowerCase() !== emailConfirm.toLowerCase()) {
      return res.status(400).json({ error: "Az email c\xEDmek nem egyeznek." });
    }
    const normalizedEmail = email.toLowerCase();
    const currentUser = req.user;
    const [existing] = await db.select({ id: users.id }).from(users).where(and2(eq2(users.email, normalizedEmail), ne(users.id, currentUser.id))).limit(1);
    if (existing) {
      return res.status(409).json({ error: "Ez az email c\xEDm m\xE1r haszn\xE1latban van." });
    }
    await db.update(users).set({ email: normalizedEmail, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, currentUser.id));
    await db.insert(activityLog).values({
      userId: currentUser.id,
      action: "email_changed",
      entityType: "user",
      entityId: currentUser.id
    });
    res.json({
      user: { id: currentUser.id, email: normalizedEmail, name: currentUser.name, role: currentUser.role },
      message: "Email c\xEDm sikeresen m\xF3dos\xEDtva."
    });
  } catch (error) {
    console.error("Change email error:", error);
    res.status(500).json({ error: "Szerverhiba az email c\xEDm m\xF3dos\xEDt\xE1sa sor\xE1n." });
  }
});
var changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A jelenlegi jelsz\xF3 megad\xE1sa k\xF6telez\u0151."),
  newPassword: z.string().min(8, "Az \xFAj jelsz\xF3nak legal\xE1bb 8 karakter hossz\xFAnak kell lennie."),
  newPasswordConfirm: z.string().min(1, "Az \xFAj jelsz\xF3 meger\u0151s\xEDt\xE9se k\xF6telez\u0151.")
});
router.patch("/me/password", requireAuth, async (req, res) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { currentPassword, newPassword, newPasswordConfirm } = parsed.data;
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ error: "Az \xFAj jelszavak nem egyeznek." });
    }
    const currentUser = req.user;
    const [freshUser] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq2(users.id, currentUser.id)).limit(1);
    if (!freshUser || !await bcrypt.compare(currentPassword, freshUser.passwordHash)) {
      return res.status(401).json({ error: "A jelenlegi jelsz\xF3 helytelen." });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, currentUser.id));
    await db.insert(activityLog).values({
      userId: currentUser.id,
      action: "password_changed",
      entityType: "user",
      entityId: currentUser.id
    });
    res.json({ success: true, message: "Jelsz\xF3 sikeresen m\xF3dos\xEDtva." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Szerverhiba a jelsz\xF3 m\xF3dos\xEDt\xE1sa sor\xE1n." });
  }
});
var auth_default = router;

// server/routes/admin/users.ts
import { Router as Router2 } from "express";
import { z as z2 } from "zod";
import { eq as eq3, ilike, sql, count, and as and3, ne as ne2 } from "drizzle-orm";
import crypto2 from "crypto";
import bcrypt2 from "bcryptjs";

// server/mailer.ts
import nodemailer from "nodemailer";
var _transporter = null;
function getTransporter() {
  if (!_transporter) {
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    console.log("[SMTP] Initializing transporter:", {
      host: process.env.SMTP_HOST,
      port: smtpPort,
      user: process.env.SMTP_USER
    });
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return _transporter;
}
function getMailFrom() {
  return `"Gerecse Ingatlan" <${process.env.SMTP_USER}>`;
}

// server/templates/shared.ts
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function emailHeader(config) {
  return `<!-- Header -->
                <tr>
                  <td align="center" style="background-color: #1B3A5C; padding: 32px 32px 16px 32px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: ${config.monogramSize}px; color: ${config.monogramColor}; font-weight: bold; letter-spacing: 1px;">G<span style="color: #FFFFFF;">I</span></td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; color: #C5A55A; letter-spacing: 3px; padding-top: 8px;">GERECSE INGATLAN</td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
}
function emailDivider(color, height) {
  return `<tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: ${height}px; background-color: ${color}; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>`;
}
function emailTitle(text6, fontSize) {
  return `<!-- Title -->
                <tr>
                  <td style="padding: 28px 32px 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: ${fontSize}px; font-weight: bold; color: #1B3A5C;">${text6}</td></tr></table>
                  </td>
                </tr>`;
}
function emailDataRow(row, index5, accentColor) {
  const isAlternate = index5 % 2 !== 0;
  const bgColor = isAlternate ? "#FAF8F5" : "#FFFFFF";
  const valueHtml = row.isLink ? `<a href="mailto:${row.value}" style="color: #1B3A5C; text-decoration: none;">${row.value}</a>` : row.value;
  return `<tr>
                        <td style="padding: 12px 16px; background-color: ${bgColor}; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${accentColor}; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">${row.label}</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${valueHtml}</td></tr></table>
                        </td>
                      </tr>`;
}
function emailDataSection(rows, accentColor) {
  const rowsHtml = rows.map((row, i) => emailDataRow(row, i, accentColor)).join("\n");
  return `<!-- Data rows -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
${rowsHtml}
                    </table>
                  </td>
                </tr>`;
}
function emailMessageSection(label, message, accentColor) {
  return `<!-- Message section -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${accentColor}; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 12px;">${label}</td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 16px 16px; border-left: 3px solid ${accentColor}; background-color: #FAF8F5;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.7; padding: 0 16px 0 0;">${message}</td></tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
}
function emailFooterDivider(color) {
  return `<!-- Footer divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 1px; background-color: ${color}; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>`;
}
function emailFooter(config) {
  return `<!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px 12px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; line-height: 1.6;">
                          Be\xE9rkez\xE9s: ${config.timestamp}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; padding-top: 2px;">
                          Forr\xE1s: ${config.source}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #AAAAAA; font-style: italic; padding-top: 8px;">
                          Ez egy automatikus \xE9rtes\xEDt\xE9s a gerecseingatlan.hu weboldalr\xF3l.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Brand footer -->
                <tr>
                  <td style="padding: 12px 32px 28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: ${config.accentColor}; letter-spacing: 2px;">GERECSE INGATLAN</td></tr></table>
                  </td>
                </tr>`;
}
function emailWrapper(innerContent) {
  return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; font-family: Arial, Helvetica, sans-serif;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF;">
${innerContent}
              </table>
            </td>
          </tr>
        </table>
      `;
}

// server/templates/welcome_new_user.ts
function welcomeNewUserHtml(params) {
  const safeEmail = escapeHtml(params.email);
  const safePassword = escapeHtml(params.tempPassword);
  const safeLoginUrl = escapeHtml(params.loginUrl);
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center" style="padding: 32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF;">
        <tr>
          <td align="center" style="background-color: #1B3A5C; padding: 32px 32px 16px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #C5A55A; font-weight: bold; letter-spacing: 1px;">G<span style="color: #FFFFFF;">I</span></td>
              </tr>
              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; color: #C5A55A; letter-spacing: 3px; padding-top: 8px;">GERECSE INGATLAN</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0; line-height: 0; font-size: 0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 3px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #1B3A5C;">\xDCdv\xF6z\xF6lj\xFCk!</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7;">
                Fi\xF3kja l\xE9trej\xF6tt a Gerecse Ingatlan adminisztr\xE1ci\xF3s fel\xFClet\xE9n. Az al\xE1bbi adatokkal tud bejelentkezni:
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 16px; background-color: #FAF8F5; border-bottom: 1px solid #E8E4DD;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px;">E-MAIL C\xCDM</td></tr>
                    <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safeEmail}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; background-color: #FFFFFF; border-bottom: 1px solid #E8E4DD;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px;">IDEIGLENES JELSZ\xD3</td></tr>
                    <tr><td style="font-family: 'Courier New', monospace; font-size: 16px; color: #1B3A5C; font-weight: bold; letter-spacing: 1px;">${safePassword}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 24px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #1B3A5C; padding: 14px 32px; border-radius: 4px;">
                  <a href="${safeLoginUrl}" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 0.5px;">Bejelentkez\xE9s</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #999999; line-height: 1.6;">
                K\xE9rj\xFCk, az els\u0151 bejelentkez\xE9s ut\xE1n v\xE1ltoztassa meg jelszav\xE1t. Ha nem \xD6n k\xE9rte ezt a fi\xF3kot, k\xE9rj\xFCk hagyja figyelmen k\xEDv\xFCl ezt az e-mailt.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 1px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 32px 28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #AAAAAA; font-style: italic;">Ez egy automatikus \xE9rtes\xEDt\xE9s a gerecseingatlan.hu weboldalr\xF3l.</td></tr>
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #C5A55A; letter-spacing: 2px; padding-top: 8px;">GERECSE INGATLAN</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}
function welcomeNewUserText(params) {
  return `\xDCdv\xF6z\xF6lj\xFCk a Gerecse Ingatlan rendszer\xE9ben!

Fi\xF3kja l\xE9trej\xF6tt az adminisztr\xE1ci\xF3s fel\xFCleten.

Bejelentkez\xE9si adatok:
  E-mail c\xEDm: ${params.email}
  Ideiglenes jelsz\xF3: ${params.tempPassword}

Bejelentkez\xE9s: ${params.loginUrl}

K\xE9rj\xFCk, az els\u0151 bejelentkez\xE9s ut\xE1n v\xE1ltoztassa meg jelszav\xE1t.
Ha nem \xD6n k\xE9rte ezt a fi\xF3kot, k\xE9rj\xFCk hagyja figyelmen k\xEDv\xFCl ezt az e-mailt.

---
Gerecse Ingatlan
Ez egy automatikus \xE9rtes\xEDt\xE9s a gerecseingatlan.hu weboldalr\xF3l.`;
}

// server/templates/newsletter_confirmation.ts
function newsletterConfirmationHtml(params) {
  const safeName = params.name ? escapeHtml(params.name) : null;
  const safeConfirmUrl = escapeHtml(params.confirmUrl);
  const greeting = safeName ? `Kedves ${safeName}!` : "Kedves Feliratkoz\xF3!";
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center" style="padding: 32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF;">
        <tr>
          <td align="center" style="background-color: #1B3A5C; padding: 32px 32px 16px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #C5A55A; font-weight: bold; letter-spacing: 1px;">G<span style="color: #FFFFFF;">I</span></td>
              </tr>
              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; color: #C5A55A; letter-spacing: 3px; padding-top: 8px;">GERECSE INGATLAN</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0; line-height: 0; font-size: 0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 3px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #1B3A5C;">H\xEDrlev\xE9l feliratkoz\xE1s</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7;">
                ${greeting}<br><br>
                K\xF6sz\xF6nj\xFCk, hogy feliratkozott a Gerecse Ingatlan h\xEDrlevel\xE9re! K\xE9rj\xFCk, er\u0151s\xEDtse meg feliratkoz\xE1s\xE1t az al\xE1bbi gombra kattintva:
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 24px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #1B3A5C; padding: 14px 32px; border-radius: 4px;">
                  <a href="${safeConfirmUrl}" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 0.5px;">Feliratkoz\xE1s meger\u0151s\xEDt\xE9se</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #999999; line-height: 1.6;">
                Ha nem \xD6n iratkozott fel, k\xE9rj\xFCk hagyja figyelmen k\xEDv\xFCl ezt az e-mailt. A meger\u0151s\xEDt\xE9s n\xE9lk\xFCl nem fogunk h\xEDrlevelet k\xFCldeni.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 1px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 32px 28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #AAAAAA; font-style: italic;">Ez egy automatikus \xE9rtes\xEDt\xE9s a gerecseingatlan.hu weboldalr\xF3l.</td></tr>
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #C5A55A; letter-spacing: 2px; padding-top: 8px;">GERECSE INGATLAN</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}
function newsletterConfirmationText(params) {
  const greeting = params.name ? `Kedves ${params.name}!` : "Kedves Feliratkoz\xF3!";
  return `H\xEDrlev\xE9l feliratkoz\xE1s meger\u0151s\xEDt\xE9se \u2013 Gerecse Ingatlan

${greeting}

K\xF6sz\xF6nj\xFCk, hogy feliratkozott a Gerecse Ingatlan h\xEDrlevel\xE9re!
K\xE9rj\xFCk, er\u0151s\xEDtse meg feliratkoz\xE1s\xE1t az al\xE1bbi linkre kattintva:

${params.confirmUrl}

Ha nem \xD6n iratkozott fel, k\xE9rj\xFCk hagyja figyelmen k\xEDv\xFCl ezt az e-mailt.
A meger\u0151s\xEDt\xE9s n\xE9lk\xFCl nem fogunk h\xEDrlevelet k\xFCldeni.

---
Gerecse Ingatlan
Ez egy automatikus \xE9rtes\xEDt\xE9s a gerecseingatlan.hu weboldalr\xF3l.`;
}

// server/services/email.ts
async function sendEmail(options) {
  try {
    const smtp = getTransporter();
    await smtp.sendMail({
      from: getMailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...options.attachments?.length ? { attachments: options.attachments } : {}
    });
  } catch (error) {
    if (!process.env.SMTP_HOST) {
      console.log("[Email] SMTP not configured \u2014 logging email to console:");
      console.log(`  To: ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
      console.log(`  Text: ${options.text.substring(0, 200)}...`);
      return;
    }
    throw error;
  }
}
async function sendWelcomeEmail(params) {
  await sendEmail({
    to: params.email,
    subject: "\xDCdv\xF6z\xF6lj\xFCk a Gerecse Ingatlan rendszer\xE9ben",
    html: welcomeNewUserHtml(params),
    text: welcomeNewUserText(params)
  });
}
async function sendNewsletterConfirmationEmail(params) {
  await sendEmail({
    to: params.email,
    subject: "H\xEDrlev\xE9l feliratkoz\xE1s meger\u0151s\xEDt\xE9se \u2013 Gerecse Ingatlan",
    html: newsletterConfirmationHtml(params),
    text: newsletterConfirmationText(params)
  });
}

// server/routes/admin/users.ts
var router2 = Router2();
router2.use(requireRole("admin"));
function escapeLikePattern(input) {
  return input.replace(/[%_\\]/g, (ch) => `\\${ch}`);
}
function generateTempPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const bytes = crypto2.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}
var listQuerySchema = z2.object({
  page: z2.coerce.number().int().positive().default(1),
  limit: z2.coerce.number().int().min(1).max(100).default(25),
  search: z2.string().max(200).optional()
});
router2.get("/", async (req, res) => {
  try {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen lek\xE9rdez\xE9si param\xE9terek." });
    }
    const { page, limit, search } = query.data;
    const offset = (page - 1) * limit;
    const safeSearch = search ? escapeLikePattern(search) : null;
    const whereClause = safeSearch ? sql`(${ilike(users.email, `%${safeSearch}%`)} OR ${ilike(users.name, `%${safeSearch}%`)})` : void 0;
    const [userList, [{ total }]] = await Promise.all([
      db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        active: users.active,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      }).from(users).where(whereClause).orderBy(sql`${users.createdAt} DESC`).limit(limit).offset(offset),
      db.select({ total: count() }).from(users).where(whereClause)
    ]);
    res.json({
      users: userList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[admin/users] List error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a felhaszn\xE1l\xF3k lek\xE9rdez\xE9sekor." });
  }
});
var createUserSchema = z2.object({
  email: z2.string().email("\xC9rv\xE9nytelen email c\xEDm.").max(320),
  name: z2.string().min(1, "A n\xE9v megad\xE1sa k\xF6telez\u0151.").max(255),
  role: z2.enum(["admin", "editor", "viewer"])
});
router2.post("/", async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "\xC9rv\xE9nytelen adatok.",
        details: result.error.flatten().fieldErrors
      });
    }
    const { email, name, role } = result.data;
    const existing = await db.select({ id: users.id }).from(users).where(eq3(users.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Ez az email c\xEDm m\xE1r regisztr\xE1lva van." });
    }
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt2.hash(tempPassword, 12);
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      name,
      role,
      passwordHash,
      active: true
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt
    });
    const adminUser = req.user;
    if (adminUser) {
      await db.insert(activityLog).values({
        userId: adminUser.id,
        action: "user_created",
        details: { message: `\xDAj felhaszn\xE1l\xF3 l\xE9trehozva: ${email} (${role})` },
        entityType: "user",
        entityId: newUser.id
      });
    }
    const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
    const loginUrl = `${siteUrl}/admin/login`;
    try {
      await sendWelcomeEmail({ email: email.toLowerCase(), tempPassword, loginUrl });
    } catch (emailError) {
      console.error("[admin/users] Welcome email failed:", emailError);
    }
    res.status(201).json({
      user: newUser,
      message: "Felhaszn\xE1l\xF3 sikeresen l\xE9trehozva."
    });
  } catch (error) {
    console.error("[admin/users] Create error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a felhaszn\xE1l\xF3 l\xE9trehoz\xE1sakor." });
  }
});
var changeEmailSchema2 = z2.object({
  email: z2.string().email("\xC9rv\xE9nytelen email c\xEDm."),
  emailConfirm: z2.string().email("\xC9rv\xE9nytelen email c\xEDm.")
});
router2.patch("/me/email", async (req, res) => {
  try {
    const parsed = changeEmailSchema2.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { email, emailConfirm } = parsed.data;
    if (email.toLowerCase() !== emailConfirm.toLowerCase()) {
      return res.status(400).json({ error: "Az email c\xEDmek nem egyeznek." });
    }
    const normalizedEmail = email.toLowerCase();
    const currentUser = req.user;
    const [existing] = await db.select({ id: users.id }).from(users).where(and3(eq3(users.email, normalizedEmail), ne2(users.id, currentUser.id))).limit(1);
    if (existing) {
      return res.status(409).json({ error: "Ez az email c\xEDm m\xE1r haszn\xE1latban van." });
    }
    await db.update(users).set({ email: normalizedEmail, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(users.id, currentUser.id));
    await db.insert(activityLog).values({
      userId: currentUser.id,
      action: "email_changed",
      entityType: "user",
      entityId: currentUser.id
    });
    res.json({
      user: { id: currentUser.id, email: normalizedEmail, name: currentUser.name, role: currentUser.role },
      message: "Email c\xEDm sikeresen m\xF3dos\xEDtva."
    });
  } catch (error) {
    console.error("[admin/users] Change email error:", error);
    res.status(500).json({ error: "Szerverhiba az email c\xEDm m\xF3dos\xEDt\xE1sa sor\xE1n." });
  }
});
var changePasswordSchema2 = z2.object({
  currentPassword: z2.string().min(1, "A jelenlegi jelsz\xF3 megad\xE1sa k\xF6telez\u0151."),
  newPassword: z2.string().min(8, "Az \xFAj jelsz\xF3nak legal\xE1bb 8 karakter hossz\xFAnak kell lennie."),
  newPasswordConfirm: z2.string().min(1, "Az \xFAj jelsz\xF3 meger\u0151s\xEDt\xE9se k\xF6telez\u0151.")
});
router2.patch("/me/password", async (req, res) => {
  try {
    const parsed = changePasswordSchema2.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { currentPassword, newPassword, newPasswordConfirm } = parsed.data;
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ error: "Az \xFAj jelszavak nem egyeznek." });
    }
    const currentUser = req.user;
    const [freshUser] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq3(users.id, currentUser.id)).limit(1);
    if (!freshUser || !await bcrypt2.compare(currentPassword, freshUser.passwordHash)) {
      return res.status(401).json({ error: "A jelenlegi jelsz\xF3 helytelen." });
    }
    const newHash = await bcrypt2.hash(newPassword, 12);
    await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(users.id, currentUser.id));
    await db.insert(activityLog).values({
      userId: currentUser.id,
      action: "password_changed",
      entityType: "user",
      entityId: currentUser.id
    });
    res.json({ success: true, message: "Jelsz\xF3 sikeresen m\xF3dos\xEDtva." });
  } catch (error) {
    console.error("[admin/users] Change password error:", error);
    res.status(500).json({ error: "Szerverhiba a jelsz\xF3 m\xF3dos\xEDt\xE1sa sor\xE1n." });
  }
});
var updateUserSchema = z2.object({
  role: z2.enum(["admin", "editor", "viewer"]).optional(),
  active: z2.boolean().optional(),
  name: z2.string().min(1).max(255).optional()
});
router2.patch("/:id", async (req, res) => {
  try {
    const idResult = z2.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen felhaszn\xE1l\xF3 azonos\xEDt\xF3." });
    }
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "\xC9rv\xE9nytelen adatok.",
        details: result.error.flatten().fieldErrors
      });
    }
    const updates = result.data;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Nincs m\xF3dos\xEDtand\xF3 adat." });
    }
    const adminUser = req.user;
    if (adminUser && adminUser.id === idResult.data && updates.active === false) {
      return res.status(400).json({ error: "Nem deaktiv\xE1lhatja saj\xE1t fi\xF3kj\xE1t." });
    }
    if (adminUser && adminUser.id === idResult.data && updates.role && updates.role !== "admin") {
      return res.status(400).json({ error: "Nem m\xF3dos\xEDthatja saj\xE1t szerepk\xF6r\xE9t." });
    }
    const [updated] = await db.update(users).set(updates).where(eq3(users.id, idResult.data)).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
      updatedAt: users.updatedAt
    });
    if (!updated) {
      return res.status(404).json({ error: "Felhaszn\xE1l\xF3 nem tal\xE1lhat\xF3." });
    }
    if (adminUser) {
      const changes = [];
      if (updates.role) changes.push(`szerepk\xF6r: ${updates.role}`);
      if (updates.active !== void 0) changes.push(updates.active ? "aktiv\xE1lva" : "deaktiv\xE1lva");
      if (updates.name) changes.push(`n\xE9v: ${updates.name}`);
      await db.insert(activityLog).values({
        userId: adminUser.id,
        action: "user_updated",
        details: { message: `Felhaszn\xE1l\xF3 m\xF3dos\xEDtva (${updated.email}): ${changes.join(", ")}` },
        entityType: "user",
        entityId: updated.id
      });
    }
    res.json({
      user: updated,
      message: "Felhaszn\xE1l\xF3 sikeresen m\xF3dos\xEDtva."
    });
  } catch (error) {
    console.error("[admin/users] Update error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a felhaszn\xE1l\xF3 m\xF3dos\xEDt\xE1sakor." });
  }
});
router2.delete("/:id", async (req, res) => {
  try {
    const idResult = z2.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen felhaszn\xE1l\xF3 azonos\xEDt\xF3." });
    }
    const adminUser = req.user;
    if (adminUser && adminUser.id === idResult.data) {
      return res.status(400).json({ error: "Nem t\xF6r\xF6lheti saj\xE1t fi\xF3kj\xE1t." });
    }
    const [deleted] = await db.delete(users).where(eq3(users.id, idResult.data)).returning({ id: users.id, email: users.email });
    if (!deleted) {
      return res.status(404).json({ error: "Felhaszn\xE1l\xF3 nem tal\xE1lhat\xF3." });
    }
    if (adminUser) {
      await db.insert(activityLog).values({
        userId: adminUser.id,
        action: "user_deleted",
        details: { message: `Felhaszn\xE1l\xF3 t\xF6r\xF6lve: ${deleted.email}` },
        entityType: "user",
        entityId: deleted.id
      });
    }
    res.json({
      success: true,
      message: "Felhaszn\xE1l\xF3 sikeresen t\xF6r\xF6lve."
    });
  } catch (error) {
    console.error("[admin/users] Delete error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a felhaszn\xE1l\xF3 t\xF6rl\xE9sekor." });
  }
});
var users_default = router2;

// server/routes/admin/content.ts
import { Router as Router3 } from "express";
import { eq as eq4, desc, sql as sql2, and as and4, ilike as ilike2, or, inArray } from "drizzle-orm";
import { z as z3 } from "zod";
var router3 = Router3();
var MAX_VERSIONS_PER_BLOCK = 10;
async function saveVersionAndPrune(blockId, content, contentType, editedBy) {
  const latestVersion = await db.select({ version: contentBlockVersions.version }).from(contentBlockVersions).where(eq4(contentBlockVersions.blockId, blockId)).orderBy(desc(contentBlockVersions.version)).limit(1);
  const nextVersion = (latestVersion[0]?.version ?? 0) + 1;
  await db.insert(contentBlockVersions).values({
    blockId,
    content,
    contentType,
    version: nextVersion,
    editedBy
  });
  const allVersions = await db.select({ id: contentBlockVersions.id }).from(contentBlockVersions).where(eq4(contentBlockVersions.blockId, blockId)).orderBy(desc(contentBlockVersions.version));
  if (allVersions.length > MAX_VERSIONS_PER_BLOCK) {
    const toDelete = allVersions.slice(MAX_VERSIONS_PER_BLOCK).map((v) => v.id);
    await db.delete(contentBlockVersions).where(inArray(contentBlockVersions.id, toDelete));
  }
}
var contentTypeEnum = z3.enum(["text", "html", "markdown", "json"]);
var langEnum = z3.enum(["hu", "en"]);
var updateBlockSchema = z3.object({
  content: z3.string(),
  contentType: contentTypeEnum.optional(),
  lang: langEnum.optional()
});
var createBlockSchema = z3.object({
  pagePath: z3.string().min(1).max(255).regex(/^\/[a-zA-Z0-9/_-]*$/),
  blockKey: z3.string().min(1).max(255).regex(/^[a-zA-Z0-9._[\]-]+$/),
  content: z3.string(),
  contentType: contentTypeEnum.default("text"),
  lang: langEnum.optional()
});
function flattenDoubleNested(content) {
  try {
    const outer = JSON.parse(content);
    if (typeof outer !== "object" || outer === null || Array.isArray(outer)) return content;
    if (!("hu" in outer) && !("en" in outer)) return content;
    let changed = false;
    for (const lang of ["hu", "en"]) {
      const val = outer[lang];
      if (typeof val !== "string") continue;
      try {
        const inner = JSON.parse(val);
        if (typeof inner === "object" && inner !== null && !Array.isArray(inner) && ("hu" in inner || "en" in inner)) {
          outer[lang] = inner[lang] ?? inner.hu ?? val;
          changed = true;
        }
      } catch {
      }
    }
    return changed ? JSON.stringify(outer) : content;
  } catch {
    return content;
  }
}
function mergeBilingualContent(existingContent, existingContentType, newContent, editLang, requestedContentType) {
  if (!editLang) {
    return { content: flattenDoubleNested(newContent), contentType: requestedContentType };
  }
  try {
    const newParsed = JSON.parse(newContent);
    if (typeof newParsed === "object" && newParsed !== null && !Array.isArray(newParsed) && ("hu" in newParsed || "en" in newParsed)) {
      return { content: flattenDoubleNested(newContent) };
    }
  } catch {
  }
  if (existingContentType === "json") {
    try {
      const jsonContent = JSON.parse(existingContent);
      if (typeof jsonContent === "object" && jsonContent !== null && !Array.isArray(jsonContent)) {
        jsonContent[editLang] = newContent;
        return { content: flattenDoubleNested(JSON.stringify(jsonContent)) };
      }
    } catch {
    }
  }
  return { content: flattenDoubleNested(newContent), contentType: requestedContentType };
}
router3.get("/pages", async (_req, res) => {
  try {
    const pages = await db.select({
      pagePath: contentBlocks.pagePath,
      blockCount: sql2`count(*)`
    }).from(contentBlocks).groupBy(contentBlocks.pagePath).orderBy(contentBlocks.pagePath);
    res.json({ pages });
  } catch (error) {
    console.error("[api/admin/content] Pages list error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az oldalak bet\xF6lt\xE9sekor." });
  }
});
router3.get("/page/{*pagePath}", async (req, res) => {
  try {
    const paramValue = req.params.pagePath;
    const raw = Array.isArray(paramValue) ? paramValue.join("/") : paramValue || "";
    const pagePath = "/" + raw.replace(/^\/+/, "").replace(/\/+$/, "");
    const normalizedPath = pagePath === "/" ? "/" : pagePath;
    const blocks = await db.select().from(contentBlocks).where(eq4(contentBlocks.pagePath, normalizedPath)).orderBy(contentBlocks.blockKey);
    res.json({ blocks, pagePath: normalizedPath });
  } catch (error) {
    console.error("[api/admin/content] Page blocks error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a blokkok bet\xF6lt\xE9sekor." });
  }
});
router3.get("/", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 50;
    const offset = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
    let whereClause;
    if (search) {
      const escapedSearch = search.replace(/[%_\\]/g, (ch) => `\\${ch}`);
      whereClause = or(
        ilike2(contentBlocks.pagePath, `%${escapedSearch}%`),
        ilike2(contentBlocks.blockKey, `%${escapedSearch}%`),
        ilike2(contentBlocks.content, `%${escapedSearch}%`)
      );
    }
    const [blocks, countResult] = await Promise.all([
      db.select().from(contentBlocks).where(whereClause).orderBy(contentBlocks.pagePath, contentBlocks.blockKey).limit(Math.min(100, Math.max(1, limit))).offset(offset),
      db.select({ count: sql2`count(*)` }).from(contentBlocks).where(whereClause)
    ]);
    const grouped = {};
    for (const block of blocks) {
      if (!grouped[block.pagePath]) {
        grouped[block.pagePath] = [];
      }
      grouped[block.pagePath].push(block);
    }
    res.json({
      blocks,
      grouped,
      total: Number(countResult[0]?.count ?? 0),
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit))
    });
  } catch (error) {
    console.error("[api/admin/content] List error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a tartalmak bet\xF6lt\xE9sekor." });
  }
});
router3.get("/:id", async (req, res) => {
  try {
    const idSchema3 = z3.string().uuid();
    const parsed = idSchema3.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [block] = await db.select().from(contentBlocks).where(eq4(contentBlocks.id, parsed.data)).limit(1);
    if (!block) {
      return res.status(404).json({ error: "Tartalom nem tal\xE1lhat\xF3." });
    }
    const versions = await db.select().from(contentBlockVersions).where(eq4(contentBlockVersions.blockId, block.id)).orderBy(desc(contentBlockVersions.version)).limit(MAX_VERSIONS_PER_BLOCK);
    res.json({ block, versions });
  } catch (error) {
    console.error("[api/admin/content] Get error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a tartalom bet\xF6lt\xE9sekor." });
  }
});
router3.patch(
  "/by-path",
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const schema = z3.object({
        pagePath: z3.string().min(1).max(255).regex(/^\/[a-zA-Z0-9/_-]*$/),
        blockKey: z3.string().min(1).max(255).regex(/^[a-zA-Z0-9._[\]-]+$/),
        content: z3.string(),
        contentType: contentTypeEnum.optional(),
        lang: langEnum.optional()
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "\xC9rv\xE9nytelen adatok.",
          details: parsed.error.flatten()
        });
      }
      const { pagePath, blockKey, content, contentType, lang } = parsed.data;
      const [existing] = await db.select().from(contentBlocks).where(
        and4(
          eq4(contentBlocks.pagePath, pagePath),
          eq4(contentBlocks.blockKey, blockKey)
        )
      ).limit(1);
      if (!existing) {
        let createContent = content;
        let createContentType = "json";
        if (lang) {
          createContent = JSON.stringify({ [lang]: content });
        } else {
          try {
            const parsed2 = JSON.parse(content);
            if (typeof parsed2 === "object" && parsed2 !== null && !Array.isArray(parsed2) && ("hu" in parsed2 || "en" in parsed2)) {
              createContent = content;
            } else {
              createContent = JSON.stringify({ hu: content });
            }
          } catch {
            createContent = JSON.stringify({ hu: content });
          }
        }
        const [block] = await db.insert(contentBlocks).values({
          pagePath,
          blockKey,
          content: flattenDoubleNested(createContent),
          contentType: createContentType,
          updatedBy: req.user.id
        }).returning();
        await db.insert(activityLog).values({
          userId: req.user.id,
          action: "content_block_created",
          details: { pagePath, blockKey, source: "inline" }
        });
        return res.status(201).json({ block });
      }
      await saveVersionAndPrune(existing.id, existing.content, existing.contentType, req.user.id);
      const merged = mergeBilingualContent(
        existing.content,
        existing.contentType,
        content,
        lang,
        contentType
      );
      const updateData = {
        content: merged.content,
        updatedBy: req.user.id,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (merged.contentType) {
        updateData.contentType = merged.contentType;
      }
      const [updated] = await db.update(contentBlocks).set(updateData).where(eq4(contentBlocks.id, existing.id)).returning();
      await db.insert(activityLog).values({
        userId: req.user.id,
        action: "content_block_updated",
        details: { pagePath, blockKey, source: "inline" }
      });
      res.json({ block: updated });
    } catch (error) {
      console.error("[api/admin/content] By-path update error:", error);
      res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a tartalom friss\xEDt\xE9sekor." });
    }
  }
);
router3.post("/", requireRole("admin", "editor"), async (req, res) => {
  try {
    const parsed = createBlockSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "\xC9rv\xE9nytelen adatok.",
        details: parsed.error.flatten()
      });
    }
    const { pagePath, blockKey, content, contentType, lang } = parsed.data;
    const editLang = lang || "hu";
    const existing = await db.select({ id: contentBlocks.id }).from(contentBlocks).where(
      and4(
        eq4(contentBlocks.pagePath, pagePath),
        eq4(contentBlocks.blockKey, blockKey)
      )
    ).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({
        error: "Ez a tartalom blokk m\xE1r l\xE9tezik ezen az oldalon."
      });
    }
    const bilingualContent = flattenDoubleNested(JSON.stringify({ [editLang]: content }));
    const [block] = await db.insert(contentBlocks).values({
      pagePath,
      blockKey,
      content: bilingualContent,
      contentType: "json",
      updatedBy: req.user.id
    }).returning();
    await db.insert(activityLog).values({
      userId: req.user.id,
      action: "content_block_created",
      details: { pagePath, blockKey }
    });
    res.status(201).json({ block });
  } catch (error) {
    console.error("[api/admin/content] Create error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a tartalom l\xE9trehoz\xE1sakor." });
  }
});
router3.patch("/:id", requireRole("admin", "editor"), async (req, res) => {
  try {
    const idSchema3 = z3.string().uuid();
    const idParsed = idSchema3.safeParse(req.params.id);
    if (!idParsed.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const bodyParsed = updateBlockSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        error: "\xC9rv\xE9nytelen adatok.",
        details: bodyParsed.error.flatten()
      });
    }
    const blockId = idParsed.data;
    const [existing] = await db.select().from(contentBlocks).where(eq4(contentBlocks.id, blockId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Tartalom nem tal\xE1lhat\xF3." });
    }
    await saveVersionAndPrune(blockId, existing.content, existing.contentType, req.user.id);
    let finalContent = bodyParsed.data.content;
    let finalContentType = bodyParsed.data.contentType;
    if (bodyParsed.data.lang) {
      const merged = mergeBilingualContent(
        existing.content,
        existing.contentType,
        bodyParsed.data.content,
        bodyParsed.data.lang,
        bodyParsed.data.contentType
      );
      finalContent = merged.content;
      finalContentType = merged.contentType;
    }
    const updateData = {
      content: flattenDoubleNested(finalContent),
      updatedBy: req.user.id,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (finalContentType) {
      updateData.contentType = finalContentType;
    }
    const [updated] = await db.update(contentBlocks).set(updateData).where(eq4(contentBlocks.id, blockId)).returning();
    await db.insert(activityLog).values({
      userId: req.user.id,
      action: "content_block_updated",
      details: { pagePath: existing.pagePath, blockKey: existing.blockKey }
    });
    res.json({ block: updated });
  } catch (error) {
    console.error("[api/admin/content] Update error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a tartalom friss\xEDt\xE9sekor." });
  }
});
router3.post(
  "/:id/rollback/:versionId",
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const paramsSchema = z3.object({
        id: z3.string().uuid(),
        versionId: z3.string().uuid()
      });
      const parsed = paramsSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3k." });
      }
      const { id: blockId, versionId } = parsed.data;
      const [block] = await db.select().from(contentBlocks).where(eq4(contentBlocks.id, blockId)).limit(1);
      if (!block) {
        return res.status(404).json({ error: "Tartalom nem tal\xE1lhat\xF3." });
      }
      const [version] = await db.select().from(contentBlockVersions).where(
        and4(
          eq4(contentBlockVersions.id, versionId),
          eq4(contentBlockVersions.blockId, blockId)
        )
      ).limit(1);
      if (!version) {
        return res.status(404).json({ error: "Verzi\xF3 nem tal\xE1lhat\xF3." });
      }
      await saveVersionAndPrune(blockId, block.content, block.contentType, req.user.id);
      const [updated] = await db.update(contentBlocks).set({
        content: version.content,
        contentType: version.contentType,
        updatedBy: req.user.id,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(contentBlocks.id, blockId)).returning();
      await db.insert(activityLog).values({
        userId: req.user.id,
        action: "content_block_rollback",
        details: { pagePath: block.pagePath, blockKey: block.blockKey, rolledBackToVersion: version.version }
      });
      res.json({ block: updated });
    } catch (error) {
      console.error("[api/admin/content] Rollback error:", error);
      res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a vissza\xE1ll\xEDt\xE1s sor\xE1n." });
    }
  }
);
router3.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const idSchema3 = z3.string().uuid();
    const parsed = idSchema3.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [block] = await db.select().from(contentBlocks).where(eq4(contentBlocks.id, parsed.data)).limit(1);
    if (!block) {
      return res.status(404).json({ error: "Tartalom nem tal\xE1lhat\xF3." });
    }
    await db.delete(contentBlocks).where(eq4(contentBlocks.id, parsed.data));
    await db.insert(activityLog).values({
      userId: req.user.id,
      action: "content_block_deleted",
      details: { pagePath: block.pagePath, blockKey: block.blockKey }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("[api/admin/content] Delete error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a tartalom t\xF6rl\xE9sekor." });
  }
});
var content_default = router3;

// server/routes/admin/newsletter.ts
import { Router as Router4 } from "express";
import { z as z4 } from "zod";
import { eq as eq5, ilike as ilike3, and as and5, gte, lte, sql as sql3, inArray as inArray2, count as count2, desc as desc2 } from "drizzle-orm";

// server/templates/newsletter_campaign.ts
function newsletterCampaignHtml(params) {
  const safeSubject = escapeHtml(params.subject);
  const safeBody = params.body.split("\n\n").map((p) => `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7; margin: 0 0 16px 0;">${escapeHtml(p)}</p>`).join("");
  const safeUnsubscribeUrl = escapeHtml(params.unsubscribeUrl);
  const preheaderHtml = params.preheader ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(params.preheader)}</span>` : "";
  const innerContent = `
${emailHeader({ monogramSize: 28, monogramColor: "#C5A55A" })}
${emailDivider("#C5A55A", 3)}
                <tr>
                  <td style="padding: 28px 32px 16px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #1B3A5C;">${safeSubject}</td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 24px 32px;">
                    ${safeBody}
                  </td>
                </tr>
${emailDivider("#E8E4DD", 1)}
                <tr>
                  <td style="padding: 20px 32px 28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #C5A55A; letter-spacing: 2px;">GERECSE INGATLAN</td></tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; padding-top: 12px;">
                          <a href="${safeUnsubscribeUrl}" style="color: #999999; text-decoration: underline;">Leiratkoz\xE1s a h\xEDrlev\xE9lr\u0151l</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
  return preheaderHtml + emailWrapper(innerContent);
}
function newsletterCampaignText(params) {
  return `${params.subject}

${params.body}

---
Gerecse Ingatlan

Leiratkoz\xE1s: ${params.unsubscribeUrl}`;
}

// server/routes/admin/newsletter.ts
var router4 = Router4();
router4.use(requireRole("admin", "editor"));
var listQuerySchema2 = z4.object({
  page: z4.coerce.number().int().positive().default(1),
  limit: z4.coerce.number().int().min(1).max(100).default(25),
  search: z4.string().max(200).optional(),
  status: z4.enum(["pending", "confirmed", "unsubscribed"]).optional(),
  dateFrom: z4.string().datetime({ offset: true }).optional(),
  dateTo: z4.string().datetime({ offset: true }).optional()
});
router4.get("/", async (req, res) => {
  try {
    const query = listQuerySchema2.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen lek\xE9rdez\xE9si param\xE9terek." });
    }
    const { page, limit, search, status, dateFrom, dateTo } = query.data;
    const offset = (page - 1) * limit;
    const conditions = [];
    if (search) {
      const escaped = search.replace(/[%_\\]/g, (c) => `\\${c}`);
      conditions.push(
        sql3`(${ilike3(newsletterSubscribers.email, `%${escaped}%`)} OR ${ilike3(newsletterSubscribers.name, `%${escaped}%`)})`
      );
    }
    if (status) {
      conditions.push(eq5(newsletterSubscribers.status, status));
    }
    if (dateFrom) {
      conditions.push(gte(newsletterSubscribers.subscribedAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(newsletterSubscribers.subscribedAt, new Date(dateTo)));
    }
    const whereClause = conditions.length > 0 ? and5(...conditions) : void 0;
    const [subscribers, [{ total }], [{ confirmed }]] = await Promise.all([
      db.select().from(newsletterSubscribers).where(whereClause).orderBy(sql3`${newsletterSubscribers.subscribedAt} DESC`).limit(limit).offset(offset),
      db.select({ total: count2() }).from(newsletterSubscribers).where(whereClause),
      db.select({ confirmed: count2() }).from(newsletterSubscribers).where(eq5(newsletterSubscribers.status, "confirmed"))
    ]);
    res.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        total,
        confirmed
      }
    });
  } catch (error) {
    console.error("[admin/newsletter] List error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a feliratkoz\xF3k lek\xE9rdez\xE9sekor." });
  }
});
router4.get("/export", async (req, res) => {
  try {
    const subscribers = await db.select().from(newsletterSubscribers).orderBy(sql3`${newsletterSubscribers.subscribedAt} DESC`);
    const csvHeader = "E-mail;N\xE9v;St\xE1tusz;Feliratkoz\xE1s d\xE1tuma;Meger\u0151s\xEDt\xE9s d\xE1tuma;IP c\xEDm\n";
    const csvRows = subscribers.map((s) => {
      const escapeCsv = (val) => {
        if (!val) return "";
        if (val.includes(";") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };
      return [
        escapeCsv(s.email),
        escapeCsv(s.name),
        escapeCsv(s.status),
        s.subscribedAt?.toISOString() ?? "",
        s.confirmedAt?.toISOString() ?? "",
        escapeCsv(s.ipAddress)
      ].join(";");
    }).join("\n");
    const bom = "\uFEFF";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="hirlevel-feliratkozok-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`
    );
    res.send(bom + csvHeader + csvRows);
  } catch (error) {
    console.error("[admin/newsletter] Export error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az export\xE1l\xE1s sor\xE1n." });
  }
});
router4.delete("/bulk", async (req, res) => {
  try {
    const schema = z4.object({
      ids: z4.array(z4.string().uuid()).min(1).max(500)
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3k." });
    }
    const deleted = await db.delete(newsletterSubscribers).where(inArray2(newsletterSubscribers.id, result.data.ids)).returning({ id: newsletterSubscribers.id });
    await db.insert(activityLog).values({
      userId: req.user.id,
      action: "newsletter_bulk_delete",
      entityType: "newsletter_subscriber",
      details: { deletedCount: deleted.length, ids: result.data.ids }
    });
    res.json({
      success: true,
      deletedCount: deleted.length,
      message: `${deleted.length} feliratkoz\xF3 t\xF6r\xF6lve.`
    });
  } catch (error) {
    console.error("[admin/newsletter] Bulk delete error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a t\xF6rl\xE9s sor\xE1n." });
  }
});
router4.delete("/:id", async (req, res) => {
  try {
    const idSchema3 = z4.string().uuid();
    const idResult = idSchema3.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [deleted] = await db.delete(newsletterSubscribers).where(eq5(newsletterSubscribers.id, idResult.data)).returning({ id: newsletterSubscribers.id, email: newsletterSubscribers.email });
    if (!deleted) {
      return res.status(404).json({ error: "Feliratkoz\xF3 nem tal\xE1lhat\xF3." });
    }
    await db.insert(activityLog).values({
      userId: req.user.id,
      action: "newsletter_delete",
      entityType: "newsletter_subscriber",
      entityId: deleted.id,
      details: { email: deleted.email }
    });
    res.json({
      success: true,
      message: "Feliratkoz\xF3 v\xE9glegesen t\xF6r\xF6lve (GDPR)."
    });
  } catch (error) {
    console.error("[admin/newsletter] Delete error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a t\xF6rl\xE9s sor\xE1n." });
  }
});
var campaignSchema = z4.object({
  subject: z4.string().min(1).max(500),
  preheader: z4.string().max(255).optional(),
  body: z4.string().min(1).max(5e4)
});
router4.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await db.select().from(newsletterCampaigns).orderBy(desc2(newsletterCampaigns.createdAt));
    res.json({ campaigns });
  } catch (error) {
    console.error("[admin/newsletter] Campaigns list error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a kamp\xE1nyok lek\xE9rdez\xE9sekor." });
  }
});
router4.post("/campaigns", async (req, res) => {
  try {
    const result = campaignSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen kamp\xE1ny adatok.", details: result.error.flatten() });
    }
    const [campaign] = await db.insert(newsletterCampaigns).values({
      subject: result.data.subject,
      preheader: result.data.preheader || null,
      body: result.data.body
    }).returning();
    res.status(201).json({ campaign });
  } catch (error) {
    console.error("[admin/newsletter] Campaign create error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a kamp\xE1ny l\xE9trehoz\xE1sakor." });
  }
});
router4.post("/campaigns/:id/test-send", async (req, res) => {
  try {
    const idResult = z4.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen kamp\xE1ny azonos\xEDt\xF3." });
    }
    const [campaign] = await db.select().from(newsletterCampaigns).where(eq5(newsletterCampaigns.id, idResult.data));
    if (!campaign) {
      return res.status(404).json({ error: "Kamp\xE1ny nem tal\xE1lhat\xF3." });
    }
    const userEmail = req.user.email;
    const baseUrl = process.env.BASE_URL || "https://gerecseingatlan.hu";
    const unsubscribeUrl = `${baseUrl}/leiratkozas?email=${encodeURIComponent(userEmail)}`;
    await sendEmail({
      to: userEmail,
      subject: `[TESZT] ${campaign.subject}`,
      html: newsletterCampaignHtml({
        subject: campaign.subject,
        preheader: campaign.preheader || void 0,
        body: campaign.body,
        unsubscribeUrl
      }),
      text: newsletterCampaignText({
        subject: campaign.subject,
        preheader: campaign.preheader || void 0,
        body: campaign.body,
        unsubscribeUrl
      })
    });
    res.json({ success: true, message: `Teszt lev\xE9l elk\xFCldve: ${userEmail}` });
  } catch (error) {
    console.error("[admin/newsletter] Test send error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a teszt lev\xE9l k\xFCld\xE9sekor." });
  }
});
router4.post("/campaigns/:id/send", async (req, res) => {
  try {
    const idResult = z4.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen kamp\xE1ny azonos\xEDt\xF3." });
    }
    const [campaign] = await db.select().from(newsletterCampaigns).where(eq5(newsletterCampaigns.id, idResult.data));
    if (!campaign) {
      return res.status(404).json({ error: "Kamp\xE1ny nem tal\xE1lhat\xF3." });
    }
    if (campaign.status === "sent") {
      return res.status(409).json({ error: "Ez a kamp\xE1ny m\xE1r el lett k\xFCldve." });
    }
    const subscribers = await db.select({ email: newsletterSubscribers.email }).from(newsletterSubscribers).where(eq5(newsletterSubscribers.status, "confirmed"));
    if (subscribers.length === 0) {
      return res.status(400).json({ error: "Nincs meger\u0151s\xEDtett feliratkoz\xF3." });
    }
    const baseUrl = process.env.BASE_URL || "https://gerecseingatlan.hu";
    let sentCount = 0;
    for (const sub of subscribers) {
      try {
        const unsubscribeUrl = `${baseUrl}/leiratkozas?email=${encodeURIComponent(sub.email)}`;
        await sendEmail({
          to: sub.email,
          subject: campaign.subject,
          html: newsletterCampaignHtml({
            subject: campaign.subject,
            preheader: campaign.preheader || void 0,
            body: campaign.body,
            unsubscribeUrl
          }),
          text: newsletterCampaignText({
            subject: campaign.subject,
            preheader: campaign.preheader || void 0,
            body: campaign.body,
            unsubscribeUrl
          })
        });
        sentCount++;
      } catch (err) {
        console.error(`[admin/newsletter] Failed to send to ${sub.email}:`, err);
      }
    }
    await db.update(newsletterCampaigns).set({
      status: "sent",
      sentAt: /* @__PURE__ */ new Date(),
      sentBy: req.user.id,
      recipientCount: sentCount
    }).where(eq5(newsletterCampaigns.id, campaign.id));
    await db.insert(activityLog).values({
      userId: req.user.id,
      action: "newsletter_campaign_sent",
      entityType: "newsletter_campaign",
      entityId: campaign.id,
      details: { subject: campaign.subject, recipientCount: sentCount }
    });
    res.json({
      success: true,
      message: `Kamp\xE1ny elk\xFCldve ${sentCount} c\xEDmzettnek.`,
      recipientCount: sentCount
    });
  } catch (error) {
    console.error("[admin/newsletter] Campaign send error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a kamp\xE1ny k\xFCld\xE9sekor." });
  }
});
router4.get("/campaigns/recipient-count", async (req, res) => {
  try {
    const [{ total }] = await db.select({ total: count2() }).from(newsletterSubscribers).where(eq5(newsletterSubscribers.status, "confirmed"));
    res.json({ count: total });
  } catch (error) {
    console.error("[admin/newsletter] Recipient count error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt." });
  }
});
var newsletter_default = router4;

// server/routes/admin/staff.ts
import { Router as Router5 } from "express";
import { z as z5 } from "zod";
import { eq as eq6, sql as sql4, count as count3, ilike as ilike4, and as and6 } from "drizzle-orm";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import path2 from "path";
import fs from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var UPLOAD_DIR = path2.resolve(__dirname2, "../../../uploads/staff");
var router5 = Router5();
router5.use(requireRole("admin", "editor"));
var PHONE_PATTERN = /^[+]?[\d\s\-()]{6,20}$/;
var phoneSchema = z5.string().max(50).refine((v) => !v || PHONE_PATTERN.test(v), {
  message: "\xC9rv\xE9nytelen telefonsz\xE1m form\xE1tum."
}).optional().nullable();
var createStaffSchema = z5.object({
  name: z5.string().min(1, "A n\xE9v megad\xE1sa k\xF6telez\u0151.").max(255),
  email: z5.string().email("\xC9rv\xE9nytelen e-mail c\xEDm.").max(320).optional().nullable(),
  phone: phoneSchema,
  roleTitle: z5.string().max(255).default("Ingatlank\xF6zvet\xEDt\u0151"),
  bio: z5.string().max(5e3).optional().nullable(),
  active: z5.boolean().default(true),
  showEmail: z5.boolean().default(true),
  showPhone: z5.boolean().default(true),
  focalPointX: z5.number().int().min(0).max(100).default(50),
  focalPointY: z5.number().int().min(0).max(100).default(25),
  dashboardAccess: z5.boolean().default(false)
});
var updateStaffSchema = z5.object({
  name: z5.string().min(1).max(255).optional(),
  email: z5.string().email("\xC9rv\xE9nytelen e-mail c\xEDm.").max(320).optional().nullable(),
  phone: phoneSchema,
  roleTitle: z5.string().max(255).optional(),
  bio: z5.string().max(5e3).optional().nullable(),
  active: z5.boolean().optional(),
  showEmail: z5.boolean().optional(),
  showPhone: z5.boolean().optional(),
  sortOrder: z5.number().int().min(0).optional(),
  focalPointX: z5.number().int().min(0).max(100).optional(),
  focalPointY: z5.number().int().min(0).max(100).optional()
});
var idSchema = z5.string().uuid("\xC9rv\xE9nytelen azonos\xEDt\xF3.");
function escapeLikePattern2(s) {
  return s.replace(/[%_\\]/g, (c) => `\\${c}`);
}
router5.get("/", async (req, res) => {
  try {
    const querySchema = z5.object({
      search: z5.string().max(200).optional(),
      active: z5.enum(["true", "false"]).optional()
    });
    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen lek\xE9rdez\xE9si param\xE9terek." });
    }
    const conditions = [];
    if (query.data.search) {
      const pattern = `%${escapeLikePattern2(query.data.search)}%`;
      conditions.push(
        sql4`(${ilike4(staff.name, pattern)} OR ${ilike4(staff.email, pattern)})`
      );
    }
    if (query.data.active !== void 0) {
      conditions.push(eq6(staff.active, query.data.active === "true"));
    }
    const whereClause = conditions.length > 0 ? and6(...conditions) : void 0;
    const [members, [{ total }]] = await Promise.all([
      db.select().from(staff).where(whereClause).orderBy(sql4`${staff.name} ASC`),
      db.select({ total: count3() }).from(staff).where(whereClause)
    ]);
    res.json({ staff: members, total });
  } catch (error) {
    console.error("[admin/staff] List error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a munkat\xE1rsak lek\xE9rdez\xE9sekor." });
  }
});
router5.get("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [member] = await db.select().from(staff).where(eq6(staff.id, idResult.data)).limit(1);
    if (!member) {
      return res.status(404).json({ error: "Munkat\xE1rs nem tal\xE1lhat\xF3." });
    }
    res.json(member);
  } catch (error) {
    console.error("[admin/staff] Get error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a munkat\xE1rs lek\xE9rdez\xE9sekor." });
  }
});
router5.post("/", async (req, res) => {
  try {
    const result = createStaffSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    const { dashboardAccess, ...staffData } = result.data;
    if (staffData.email) {
      const existingStaff = await db.select({ id: staff.id }).from(staff).where(eq6(staff.email, staffData.email.toLowerCase())).limit(1);
      if (existingStaff.length > 0) {
        return res.status(409).json({ error: "Ez az e-mail c\xEDm m\xE1r egy m\xE1sik munkat\xE1rshoz tartozik." });
      }
    }
    let userId = null;
    if (dashboardAccess && staffData.email) {
      const existingUser = await db.select({ id: users.id }).from(users).where(eq6(users.email, staffData.email.toLowerCase())).limit(1);
      if (existingUser.length > 0) {
        return res.status(409).json({ error: "Ez az e-mail c\xEDm m\xE1r regisztr\xE1lva van felhaszn\xE1l\xF3k\xE9nt." });
      }
      const tempPassword = randomBytes(12).toString("base64url");
      const passwordHash = await hash(tempPassword, 12);
      const [newUser] = await db.insert(users).values({
        email: staffData.email,
        passwordHash,
        name: staffData.name,
        role: "editor"
      }).returning();
      userId = newUser.id;
      const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
      const loginUrl = `${siteUrl}/admin/login`;
      await sendWelcomeEmail({
        email: staffData.email,
        tempPassword,
        loginUrl
      });
    }
    const [member] = await db.insert(staff).values({
      ...staffData,
      userId
    }).returning();
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "staff_created",
      entityType: "staff",
      entityId: member.id,
      details: { name: member.name, roleTitle: member.roleTitle }
    });
    res.status(201).json(member);
  } catch (error) {
    console.error("[admin/staff] Create error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a munkat\xE1rs l\xE9trehoz\xE1sakor." });
  }
});
router5.patch("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const result = updateStaffSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    const [updated] = await db.update(staff).set(result.data).where(eq6(staff.id, idResult.data)).returning();
    if (!updated) {
      return res.status(404).json({ error: "Munkat\xE1rs nem tal\xE1lhat\xF3." });
    }
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "staff_updated",
      entityType: "staff",
      entityId: updated.id,
      details: { name: updated.name, changes: Object.keys(result.data) }
    });
    res.json(updated);
  } catch (error) {
    console.error("[admin/staff] Update error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a munkat\xE1rs m\xF3dos\xEDt\xE1sakor." });
  }
});
router5.delete("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [deleted] = await db.delete(staff).where(eq6(staff.id, idResult.data)).returning({ id: staff.id, name: staff.name, photoUrl: staff.photoUrl });
    if (!deleted) {
      return res.status(404).json({ error: "Munkat\xE1rs nem tal\xE1lhat\xF3." });
    }
    if (deleted.photoUrl) {
      const photoPath = path2.resolve(__dirname2, "../../..", deleted.photoUrl);
      if (photoPath.startsWith(UPLOAD_DIR)) {
        fs.unlink(photoPath, () => {
        });
      }
    }
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "staff_deleted",
      entityType: "staff",
      entityId: deleted.id,
      details: { name: deleted.name }
    });
    res.json({
      success: true,
      message: "Munkat\xE1rs sikeresen t\xF6r\xF6lve."
    });
  } catch (error) {
    console.error("[admin/staff] Delete error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a munkat\xE1rs t\xF6rl\xE9sekor." });
  }
});
function detectImageFormat(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }
  if (buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10) {
    return { ext: ".png", mime: "image/png" };
  }
  if (buffer[0] === 82 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 70 && buffer[8] === 87 && buffer[9] === 69 && buffer[10] === 66 && buffer[11] === 80) {
    return { ext: ".webp", mime: "image/webp" };
  }
  return null;
}
router5.post("/:id/photo", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [member] = await db.select().from(staff).where(eq6(staff.id, idResult.data)).limit(1);
    if (!member) {
      return res.status(404).json({ error: "Munkat\xE1rs nem tal\xE1lhat\xF3." });
    }
    const contentType = req.headers["content-type"] ?? "";
    if (!contentType.startsWith("image/")) {
      return res.status(400).json({ error: "Csak k\xE9pf\xE1jl t\xF6lthet\u0151 fel." });
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: "Nem t\xE1mogatott k\xE9pform\xE1tum. Haszn\xE1ljon JPEG, PNG vagy WebP form\xE1tumot." });
    }
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    const chunks = [];
    const MAX_SIZE = 5 * 1024 * 1024;
    let totalSize = 0;
    req.on("data", (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_SIZE) {
        res.status(413).json({ error: "A f\xE1jl m\xE9rete nem haladhatja meg az 5 MB-ot." });
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
        return res.status(400).json({ error: "A f\xE1jl tartalma nem felismerhet\u0151 k\xE9pform\xE1tum. Haszn\xE1ljon JPEG, PNG vagy WebP form\xE1tumot." });
      }
      const filename = `${idResult.data}${detected.ext}`;
      const filePath = path2.join(UPLOAD_DIR, filename);
      await fs.promises.writeFile(filePath, buffer);
      if (member.photoUrl) {
        const oldPath = path2.resolve(__dirname2, "../../..", member.photoUrl);
        if (oldPath !== filePath && oldPath.startsWith(UPLOAD_DIR)) {
          fs.unlink(oldPath, () => {
          });
        }
      }
      const photoUrl = `/uploads/staff/${filename}`;
      const [updated] = await db.update(staff).set({ photoUrl }).where(eq6(staff.id, idResult.data)).returning();
      res.json({ photoUrl: updated.photoUrl });
    });
    req.on("error", () => {
      res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a f\xE1jl felt\xF6lt\xE9sekor." });
    });
  } catch (error) {
    console.error("[admin/staff] Photo upload error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a k\xE9p felt\xF6lt\xE9sekor." });
  }
});
var staff_default = router5;

// server/routes/admin/calendar.ts
import { Router as Router6 } from "express";
import { z as z6 } from "zod";
import { eq as eq7, and as and7, gte as gte2, lte as lte2, sql as sql5, inArray as inArray3 } from "drizzle-orm";

// server/templates/calendar_invite.ts
function formatHungarianDate(date) {
  const months = [
    "janu\xE1r",
    "febru\xE1r",
    "m\xE1rcius",
    "\xE1prilis",
    "m\xE1jus",
    "j\xFAnius",
    "j\xFAlius",
    "augusztus",
    "szeptember",
    "okt\xF3ber",
    "november",
    "december"
  ];
  const y = date.getFullYear();
  const m = months[date.getMonth()];
  const d = date.getDate();
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}. ${m} ${d}. ${h}:${min}`;
}
function generateIcsContent(params) {
  const formatIcsDate2 = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@gerecseingatlan.hu`;
  const now = formatIcsDate2(/* @__PURE__ */ new Date());
  let ics = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Gerecse Ingatlan//Calendar//HU\r
METHOD:REQUEST\r
BEGIN:VEVENT\r
UID:${uid}\r
DTSTAMP:${now}\r
DTSTART:${formatIcsDate2(params.startDatetime)}\r
DTEND:${formatIcsDate2(params.endDatetime)}\r
SUMMARY:${escapeIcsText(params.eventTitle)}\r
ORGANIZER;CN=${escapeIcsText(params.organizerName)}:mailto:info@gerecseingatlan.hu\r
`;
  if (params.location) {
    ics += `LOCATION:${escapeIcsText(params.location)}\r
`;
  }
  if (params.description) {
    ics += `DESCRIPTION:${escapeIcsText(params.description)}\r
`;
  }
  ics += `END:VEVENT\r
END:VCALENDAR\r
`;
  return ics;
}
function escapeIcsText(text6) {
  return text6.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
function calendarInviteHtml(params) {
  const accentColor = "#3B82F6";
  const safeTitle = escapeHtml(params.eventTitle);
  const startHu = formatHungarianDate(params.startDatetime);
  const endHu = formatHungarianDate(params.endDatetime);
  const rows = [
    { label: "Esem\xE9ny", value: safeTitle },
    { label: "Kezd\xE9s", value: startHu },
    { label: "Befejez\xE9s", value: endHu }
  ];
  if (params.location) {
    rows.push({ label: "Helysz\xEDn", value: escapeHtml(params.location) });
  }
  rows.push({ label: "Szervez\u0151", value: escapeHtml(params.organizerName) });
  let inner = "";
  inner += emailHeader({ monogramSize: 28, monogramColor: "#C5A55A" });
  inner += emailDivider(accentColor, 3);
  inner += emailTitle("Napt\xE1r megh\xEDv\xF3", 22);
  inner += emailDataSection(rows, accentColor);
  if (params.description) {
    inner += `<tr>
      <td style="padding: 16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">LE\xCDR\xC1S</td></tr>
          <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.7; padding: 12px 16px; background-color: #FAF8F5; border-left: 3px solid ${accentColor};">${escapeHtml(params.description)}</td></tr>
        </table>
      </td>
    </tr>`;
  }
  inner += emailFooterDivider(accentColor);
  inner += emailFooter({
    timestamp: startHu,
    source: "Gerecse Ingatlan Napt\xE1r",
    accentColor
  });
  return emailWrapper(inner);
}
function calendarInviteText(params) {
  const startHu = formatHungarianDate(params.startDatetime);
  const endHu = formatHungarianDate(params.endDatetime);
  let text6 = `Napt\xE1r megh\xEDv\xF3 \u2014 Gerecse Ingatlan

`;
  text6 += `Esem\xE9ny: ${params.eventTitle}
`;
  text6 += `Kezd\xE9s: ${startHu}
`;
  text6 += `Befejez\xE9s: ${endHu}
`;
  if (params.location) {
    text6 += `Helysz\xEDn: ${params.location}
`;
  }
  text6 += `Szervez\u0151: ${params.organizerName}
`;
  if (params.description) {
    text6 += `
Le\xEDr\xE1s:
${params.description}
`;
  }
  text6 += `
---
Gerecse Ingatlan
Ez egy automatikus \xE9rtes\xEDt\xE9s a gerecseingatlan.hu weboldalr\xF3l.`;
  return text6;
}

// server/routes/admin/calendar.ts
var router6 = Router6();
router6.use(requireRole("admin", "editor"));
var EVENT_TYPES = [
  "ingatlan_megtekintes",
  "ugyfel_talalkozo",
  "belso_megbeszeles",
  "szabadsag",
  "egyeb"
];
var createEventSchema = z6.object({
  title: z6.string().min(1, "A c\xEDm megad\xE1sa k\xF6telez\u0151.").max(255),
  description: z6.string().max(5e3).optional().nullable(),
  startDatetime: z6.string().datetime({ offset: true }),
  endDatetime: z6.string().datetime({ offset: true }),
  staffId: z6.string().uuid().optional().nullable(),
  eventType: z6.enum(EVENT_TYPES).default("egyeb"),
  location: z6.string().max(500).optional().nullable(),
  propertyId: z6.string().max(255).optional().nullable(),
  color: z6.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable()
}).refine(
  (data) => new Date(data.endDatetime) > new Date(data.startDatetime),
  { message: "A befejez\xE9s d\xE1tuma a kezd\xE9s ut\xE1n kell legyen.", path: ["endDatetime"] }
);
var updateEventSchema = z6.object({
  title: z6.string().min(1).max(255).optional(),
  description: z6.string().max(5e3).optional().nullable(),
  startDatetime: z6.string().datetime({ offset: true }).optional(),
  endDatetime: z6.string().datetime({ offset: true }).optional(),
  staffId: z6.string().uuid().optional().nullable(),
  eventType: z6.enum(EVENT_TYPES).optional(),
  location: z6.string().max(500).optional().nullable(),
  propertyId: z6.string().max(255).optional().nullable(),
  color: z6.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable()
});
var listQuerySchema3 = z6.object({
  start: z6.string().datetime({ offset: true }).optional(),
  end: z6.string().datetime({ offset: true }).optional(),
  staffId: z6.string().uuid().optional(),
  eventType: z6.enum(EVENT_TYPES).optional()
});
var idSchema2 = z6.string().uuid("\xC9rv\xE9nytelen azonos\xEDt\xF3.");
router6.get("/", async (req, res) => {
  try {
    const query = listQuerySchema3.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen lek\xE9rdez\xE9si param\xE9terek." });
    }
    const conditions = [];
    if (query.data.start) {
      conditions.push(gte2(calendarEvents.endDatetime, new Date(query.data.start)));
    }
    if (query.data.end) {
      conditions.push(lte2(calendarEvents.startDatetime, new Date(query.data.end)));
    }
    if (query.data.staffId) {
      conditions.push(eq7(calendarEvents.staffId, query.data.staffId));
    }
    if (query.data.eventType) {
      conditions.push(eq7(calendarEvents.eventType, query.data.eventType));
    }
    const whereClause = conditions.length > 0 ? and7(...conditions) : void 0;
    const events = await db.select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startDatetime: calendarEvents.startDatetime,
      endDatetime: calendarEvents.endDatetime,
      staffId: calendarEvents.staffId,
      staffName: staff.name,
      createdBy: calendarEvents.createdBy,
      eventType: calendarEvents.eventType,
      location: calendarEvents.location,
      propertyId: calendarEvents.propertyId,
      color: calendarEvents.color,
      createdAt: calendarEvents.createdAt,
      updatedAt: calendarEvents.updatedAt
    }).from(calendarEvents).leftJoin(staff, eq7(calendarEvents.staffId, staff.id)).where(whereClause).orderBy(sql5`${calendarEvents.startDatetime} ASC`);
    res.json({ events });
  } catch (error) {
    console.error("[admin/calendar] List error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az esem\xE9nyek lek\xE9rdez\xE9sekor." });
  }
});
router6.get("/:id", async (req, res) => {
  try {
    const idResult = idSchema2.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [event] = await db.select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startDatetime: calendarEvents.startDatetime,
      endDatetime: calendarEvents.endDatetime,
      staffId: calendarEvents.staffId,
      staffName: staff.name,
      createdBy: calendarEvents.createdBy,
      eventType: calendarEvents.eventType,
      location: calendarEvents.location,
      propertyId: calendarEvents.propertyId,
      color: calendarEvents.color,
      createdAt: calendarEvents.createdAt,
      updatedAt: calendarEvents.updatedAt
    }).from(calendarEvents).leftJoin(staff, eq7(calendarEvents.staffId, staff.id)).where(eq7(calendarEvents.id, idResult.data)).limit(1);
    if (!event) {
      return res.status(404).json({ error: "Esem\xE9ny nem tal\xE1lhat\xF3." });
    }
    res.json(event);
  } catch (error) {
    console.error("[admin/calendar] Get error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az esem\xE9ny lek\xE9rdez\xE9sekor." });
  }
});
router6.post("/", async (req, res) => {
  try {
    const result = createEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    if (result.data.staffId) {
      const [staffMember] = await db.select({ id: staff.id }).from(staff).where(eq7(staff.id, result.data.staffId)).limit(1);
      if (!staffMember) {
        return res.status(400).json({ error: "A kiv\xE1lasztott munkat\xE1rs nem tal\xE1lhat\xF3." });
      }
    }
    const createdBy = req.user?.id;
    if (!createdBy) {
      return res.status(401).json({ error: "Nincs bejelentkezve." });
    }
    const [event] = await db.insert(calendarEvents).values({
      title: result.data.title,
      description: result.data.description ?? null,
      startDatetime: new Date(result.data.startDatetime),
      endDatetime: new Date(result.data.endDatetime),
      staffId: result.data.staffId ?? null,
      createdBy,
      eventType: result.data.eventType,
      location: result.data.location ?? null,
      propertyId: result.data.propertyId ?? null,
      color: result.data.color ?? null
    }).returning();
    await db.insert(activityLog).values({
      userId: createdBy,
      action: "event_created",
      entityType: "calendar_event",
      entityId: event.id,
      details: { title: event.title, eventType: event.eventType }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error("[admin/calendar] Create error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az esem\xE9ny l\xE9trehoz\xE1sakor." });
  }
});
router6.patch("/:id", async (req, res) => {
  try {
    const idResult = idSchema2.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const result = updateEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    const updateData = {};
    if (result.data.title !== void 0) updateData.title = result.data.title;
    if (result.data.description !== void 0) updateData.description = result.data.description;
    if (result.data.startDatetime !== void 0) updateData.startDatetime = new Date(result.data.startDatetime);
    if (result.data.endDatetime !== void 0) updateData.endDatetime = new Date(result.data.endDatetime);
    if (result.data.staffId !== void 0) updateData.staffId = result.data.staffId;
    if (result.data.eventType !== void 0) updateData.eventType = result.data.eventType;
    if (result.data.location !== void 0) updateData.location = result.data.location;
    if (result.data.propertyId !== void 0) updateData.propertyId = result.data.propertyId;
    if (result.data.color !== void 0) updateData.color = result.data.color;
    if (updateData.startDatetime && updateData.endDatetime) {
      if (updateData.endDatetime <= updateData.startDatetime) {
        return res.status(400).json({ error: "A befejez\xE9s d\xE1tuma a kezd\xE9s ut\xE1n kell legyen." });
      }
    }
    const [updated] = await db.update(calendarEvents).set(updateData).where(eq7(calendarEvents.id, idResult.data)).returning();
    if (!updated) {
      return res.status(404).json({ error: "Esem\xE9ny nem tal\xE1lhat\xF3." });
    }
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "event_updated",
      entityType: "calendar_event",
      entityId: updated.id,
      details: { title: updated.title, changes: Object.keys(updateData) }
    });
    res.json(updated);
  } catch (error) {
    console.error("[admin/calendar] Update error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az esem\xE9ny m\xF3dos\xEDt\xE1sakor." });
  }
});
router6.delete("/:id", async (req, res) => {
  try {
    const idResult = idSchema2.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [deleted] = await db.delete(calendarEvents).where(eq7(calendarEvents.id, idResult.data)).returning();
    if (!deleted) {
      return res.status(404).json({ error: "Esem\xE9ny nem tal\xE1lhat\xF3." });
    }
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "event_deleted",
      entityType: "calendar_event",
      entityId: deleted.id,
      details: { title: deleted.title }
    });
    res.json({
      success: true,
      message: "Esem\xE9ny sikeresen t\xF6r\xF6lve."
    });
  } catch (error) {
    console.error("[admin/calendar] Delete error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az esem\xE9ny t\xF6rl\xE9sekor." });
  }
});
var inviteSchema = z6.object({
  staffIds: z6.array(z6.string().uuid()).min(1, "Legal\xE1bb egy munkat\xE1rsat v\xE1lasszon ki.")
});
router6.get("/:eventId/invitees", async (req, res) => {
  try {
    const idResult = idSchema2.safeParse(req.params.eventId);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const invitees = await db.select({
      id: eventInvitees.id,
      eventId: eventInvitees.eventId,
      staffId: eventInvitees.staffId,
      email: eventInvitees.email,
      staffName: staff.name,
      notifiedAt: eventInvitees.notifiedAt,
      createdAt: eventInvitees.createdAt
    }).from(eventInvitees).leftJoin(staff, eq7(eventInvitees.staffId, staff.id)).where(eq7(eventInvitees.eventId, idResult.data));
    res.json({ invitees });
  } catch (error) {
    console.error("[admin/calendar] List invitees error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a megh\xEDvottak lek\xE9rdez\xE9sekor." });
  }
});
router6.post("/:eventId/invitees", async (req, res) => {
  try {
    const idResult = idSchema2.safeParse(req.params.eventId);
    if (!idResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const result = inviteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    const [event] = await db.select().from(calendarEvents).where(eq7(calendarEvents.id, idResult.data)).limit(1);
    if (!event) {
      return res.status(404).json({ error: "Esem\xE9ny nem tal\xE1lhat\xF3." });
    }
    const staffMembers = await db.select({ id: staff.id, name: staff.name, email: staff.email }).from(staff).where(inArray3(staff.id, result.data.staffIds));
    if (staffMembers.length === 0) {
      return res.status(400).json({ error: "A kiv\xE1lasztott munkat\xE1rsak nem tal\xE1lhat\xF3ak." });
    }
    const organizer = await db.select({ name: users.name }).from(users).where(eq7(users.id, req.user.id)).limit(1);
    const organizerName = organizer[0]?.name ?? "Gerecse Ingatlan";
    const inviteParams = {
      eventTitle: event.title,
      startDatetime: event.startDatetime,
      endDatetime: event.endDatetime,
      location: event.location,
      description: event.description,
      organizerName
    };
    const icsContent = generateIcsContent(inviteParams);
    const created = [];
    for (const member of staffMembers) {
      if (!member.email) continue;
      const existing = await db.select({ id: eventInvitees.id }).from(eventInvitees).where(
        and7(
          eq7(eventInvitees.eventId, idResult.data),
          eq7(eventInvitees.staffId, member.id)
        )
      ).limit(1);
      if (existing.length > 0) continue;
      const [invitee] = await db.insert(eventInvitees).values({
        eventId: idResult.data,
        staffId: member.id,
        email: member.email
      }).returning();
      try {
        await sendEmail({
          to: member.email,
          subject: `Napt\xE1r megh\xEDv\xF3: ${event.title}`,
          html: calendarInviteHtml(inviteParams),
          text: calendarInviteText(inviteParams),
          attachments: [{
            filename: "invite.ics",
            content: icsContent,
            contentType: "text/calendar; method=REQUEST"
          }]
        });
        await db.update(eventInvitees).set({ notifiedAt: /* @__PURE__ */ new Date() }).where(eq7(eventInvitees.id, invitee.id));
      } catch (emailErr) {
        console.error(`[admin/calendar] Failed to send invite to ${member.email}:`, emailErr);
      }
      created.push(invitee);
    }
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "invitees_added",
      entityType: "calendar_event",
      entityId: event.id,
      details: { inviteeCount: created.length, staffIds: result.data.staffIds }
    });
    res.status(201).json({ invitees: created, added: created.length });
  } catch (error) {
    console.error("[admin/calendar] Add invitees error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a megh\xEDvottak hozz\xE1ad\xE1sakor." });
  }
});
router6.delete("/:eventId/invitees/:inviteeId", async (req, res) => {
  try {
    const eventIdResult = idSchema2.safeParse(req.params.eventId);
    const inviteeIdResult = idSchema2.safeParse(req.params.inviteeId);
    if (!eventIdResult.success || !inviteeIdResult.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen azonos\xEDt\xF3." });
    }
    const [deleted] = await db.delete(eventInvitees).where(
      and7(
        eq7(eventInvitees.id, inviteeIdResult.data),
        eq7(eventInvitees.eventId, eventIdResult.data)
      )
    ).returning();
    if (!deleted) {
      return res.status(404).json({ error: "Megh\xEDvott nem tal\xE1lhat\xF3." });
    }
    res.json({ success: true, message: "Megh\xEDvott sikeresen elt\xE1vol\xEDtva." });
  } catch (error) {
    console.error("[admin/calendar] Remove invitee error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a megh\xEDvott elt\xE1vol\xEDt\xE1sakor." });
  }
});
var calendar_default = router6;

// server/routes/admin/dashboard.ts
import { Router as Router7 } from "express";
import { eq as eq8, sql as sql6, gte as gte3, lte as lte3, and as and8, count as count4, desc as desc3 } from "drizzle-orm";

// server/ingatlan-feed.ts
import { XMLParser } from "fast-xml-parser";

// shared/types/property.ts
import { z as z7 } from "zod";
var RawIngatlanSchema = z7.object({
  id: z7.coerce.string(),
  nyilvantartasi_szam: z7.coerce.string().optional().default(""),
  ertekesito_id: z7.coerce.string().optional().default("0"),
  nev: z7.coerce.string().optional().default(""),
  kategoria: z7.coerce.number(),
  tipus: z7.coerce.number(),
  altipus: z7.coerce.number().optional(),
  irszam: z7.coerce.string().optional().default(""),
  telepules: z7.coerce.string().optional().default(""),
  telepulesresz: z7.coerce.string().optional().default(""),
  utca: z7.coerce.string().optional().default(""),
  ar: z7.coerce.number().default(0),
  penznem: z7.string().optional().default("HUF"),
  alapterulet: z7.coerce.number().default(0),
  szobaszam: z7.coerce.number().optional().default(0),
  felszobaszam: z7.coerce.number().optional().default(0),
  leiras: z7.any().optional().default(""),
  kepek: z7.any().optional(),
  video: z7.coerce.string().optional().default("")
});
var NormalizedPropertySchema = z7.object({
  id: z7.string(),
  slug: z7.string(),
  listingType: z7.enum(["elado", "kiado"]),
  category: z7.enum([
    "lakas",
    "haz",
    "telek",
    "garazs",
    "nyaralo",
    "iroda",
    "uzlethelyiseg",
    "vendeglatas",
    "ipari",
    "mezogazdasagi",
    "szoba",
    "egyeb"
  ]),
  subCategory: z7.string(),
  title: z7.string(),
  price: z7.number(),
  priceFormatted: z7.string(),
  currency: z7.string(),
  area: z7.number(),
  rooms: z7.number(),
  halfRooms: z7.number(),
  totalRooms: z7.string(),
  address: z7.object({
    zip: z7.string(),
    city: z7.string(),
    district: z7.string(),
    street: z7.string()
  }),
  location: z7.object({ lat: z7.number(), lng: z7.number() }).optional(),
  description: z7.string(),
  images: z7.array(z7.string()),
  thumbnailUrl: z7.string(),
  builtYear: z7.number().optional(),
  lotSize: z7.number().optional(),
  features: z7.record(z7.union([z7.string(), z7.number(), z7.boolean()])),
  featured: z7.boolean(),
  videoUrl: z7.string().optional()
});
var FeedResultSchema = z7.object({
  office: z7.object({
    name: z7.string(),
    email: z7.string(),
    phone: z7.string(),
    address: z7.string(),
    web: z7.string()
  }),
  properties: z7.array(NormalizedPropertySchema),
  fetchedAt: z7.string(),
  propertyCount: z7.number(),
  errors: z7.array(z7.string())
});
function mapKategoriaToListingType(code) {
  return code === 2 ? "kiado" : "elado";
}
var tipusToCategoryMap = {
  1: "lakas",
  2: "haz",
  3: "telek",
  4: "garazs",
  5: "nyaralo",
  6: "iroda",
  7: "uzlethelyiseg",
  8: "vendeglatas",
  9: "ipari",
  10: "mezogazdasagi",
  13: "szoba"
};
function mapTipusToCategory(code) {
  return tipusToCategoryMap[code] ?? "egyeb";
}
var altipusToSubCategoryMap = {
  // Lakás
  2: "tegla-lakas",
  3: "panel-lakas",
  82: "csusztatott-zsalus",
  // Ház
  4: "csaladi-haz",
  5: "ikerhaz",
  6: "sorhaz",
  7: "hazresz",
  8: "tanya",
  9: "kastely",
  // Telek
  10: "kulterulet-telek",
  11: "belterulet-telek",
  12: "uduloterulet-telek",
  13: "egyeb-telek",
  50: "zartkert-telek",
  // Nyaraló
  16: "nyaralo-telek",
  17: "hetvegi-hazas",
  18: "udulohazas",
  // Iroda
  19: "irodahaz-a",
  20: "csaladi-hazban-iroda",
  21: "lakasban-iroda",
  22: "egyeb-iroda",
  46: "irodahaz-b",
  47: "irodahaz-c",
  // Üzlethelyiség
  23: "udvarban",
  24: "uzlethazban",
  25: "utcai-bejarattal",
  26: "egyeb-uzlethelyiseg",
  // Vendéglátás
  27: "szalloda",
  28: "etterem",
  29: "egyeb-vendeglato",
  60: "borozo",
  61: "cukraszda",
  // Ipari
  30: "telephely",
  31: "raktar",
  32: "muhely",
  33: "egyeb-ipari",
  43: "ipari-park",
  44: "csarnok",
  45: "gyarepulet",
  62: "aruhaz",
  63: "autoszalon",
  64: "fejlesztesi-terulet",
  // Mezőgazdasági
  34: "mg-tanya",
  35: "mg-zartkert",
  48: "mg-belterulet",
  49: "mg-kulterulet",
  51: "erdo",
  52: "fold",
  53: "szantofold",
  54: "gyumolcsos",
  55: "istallo",
  56: "halasto",
  57: "gyep",
  58: "nadas",
  59: "mg-egyeb"
};
function mapAltipusToSubCategory(code) {
  if (code === void 0) return "egyeb";
  return altipusToSubCategoryMap[code] ?? "egyeb";
}
var subCategoryLabels = {
  // Lakás
  "tegla-lakas": "t\xE9gla lak\xE1s",
  "panel-lakas": "panel lak\xE1s",
  "csusztatott-zsalus": "Cs\xFAsztatott zsalus",
  // Ház
  "csaladi-haz": "Csal\xE1di h\xE1z",
  "ikerhaz": "Ikerh\xE1z",
  "sorhaz": "Sorh\xE1z",
  "hazresz": "H\xE1zr\xE9sz",
  "tanya": "Tanya",
  "kastely": "Kast\xE9ly",
  // Telek
  "kulterulet-telek": "K\xFClter\xFClet",
  "belterulet-telek": "Belter\xFClet",
  "uduloterulet-telek": "\xDCd\xFCl\u0151\xF6vezet",
  "zartkert-telek": "Z\xE1rtkert",
  "egyeb-telek": "Egy\xE9b telek",
  // Nyaraló
  "nyaralo-telek": "Nyaral\xF3telek",
  "hetvegi-hazas": "H\xE9tv\xE9gi h\xE1zas",
  "udulohazas": "\xDCd\xFCl\u0151h\xE1zas",
  // Iroda
  "irodahaz-a": 'Irodah\xE1z "A"',
  "irodahaz-b": 'Irodah\xE1z "B"',
  "irodahaz-c": 'Irodah\xE1z "C"',
  "csaladi-hazban-iroda": "Csal\xE1di h\xE1zban",
  "lakasban-iroda": "Lak\xE1sban",
  "egyeb-iroda": "Egy\xE9b iroda",
  // Üzlethelyiség
  "udvarban": "Udvarban",
  "uzlethazban": "\xDCzleth\xE1zban",
  "utcai-bejarattal": "Utcai bej\xE1rattal",
  "egyeb-uzlethelyiseg": "Egy\xE9b \xFCzlethelyis\xE9g",
  // Vendéglátás
  "szalloda": "Sz\xE1lloda, hotel, panzi\xF3",
  "etterem": "\xC9tterem, vend\xE9gl\u0151",
  "egyeb-vendeglato": "Egy\xE9b vend\xE9gl\xE1t\xF3 egys\xE9g",
  "borozo": "Boroz\xF3, s\xF6r\xF6z\u0151, b\xFCf\xE9",
  "cukraszda": "Cukr\xE1szda, pressz\xF3",
  // Ipari
  "telephely": "Telephely",
  "raktar": "Rakt\xE1r",
  "muhely": "M\u0171hely",
  "egyeb-ipari": "Egy\xE9b ipari ingatlan",
  "ipari-park": "Ipari park",
  "csarnok": "Csarnok",
  "gyarepulet": "Gy\xE1r\xE9p\xFClet",
  "aruhaz": "\xC1ruh\xE1z",
  "autoszalon": "Aut\xF3szalon",
  "fejlesztesi-terulet": "Fejleszt\xE9si ter\xFClet",
  // Mezőgazdasági
  "mg-tanya": "Tanya",
  "mg-zartkert": "Z\xE1rtkert",
  "mg-belterulet": "Belter\xFClet",
  "mg-kulterulet": "K\xFClter\xFClet",
  "erdo": "Erd\u0151",
  "fold": "F\xF6ld",
  "szantofold": "Sz\xE1nt\xF3f\xF6ld, legel\u0151",
  "gyumolcsos": "Gy\xFCm\xF6lcs\xF6s, sz\u0151l\u0151",
  "istallo": "Ist\xE1ll\xF3",
  "halasto": "Halast\xF3",
  "gyep": "Gyep",
  "nadas": "N\xE1das",
  "mg-egyeb": "Egy\xE9b",
  "egyeb": "Egy\xE9b"
};
function getSubCategoryLabel(sub) {
  return subCategoryLabels[sub] ?? sub;
}
function subCategoryToTypeCode(sub) {
  if (sub === "panel-lakas") return "panel";
  if (sub === "tegla-lakas" || sub === "csusztatott-zsalus") return "brick";
  if (sub === "csaladi-haz" || sub === "ikerhaz" || sub === "sorhaz" || sub === "hazresz" || sub === "tanya" || sub === "kastely") return "house";
  if (sub.includes("telek") || sub.includes("kulterulet") || sub.includes("belterulet") || sub === "uduloterulet-telek") return "land";
  if (sub.startsWith("mg-") || sub === "erdo" || sub === "fold" || sub === "szantofold" || sub === "gyumolcsos" || sub === "istallo" || sub === "halasto" || sub === "gyep" || sub === "nadas") return "land";
  if (sub === "hetvegi-hazas" || sub === "udulohazas" || sub === "nyaralo-telek") return "holiday";
  if (sub === "telephely" || sub === "raktar" || sub === "muhely" || sub === "csarnok" || sub === "gyarepulet" || sub === "ipari-park" || sub === "aruhaz" || sub === "autoszalon" || sub === "fejlesztesi-terulet" || sub === "egyeb-ipari") return "industrial";
  return "house";
}
function formatPriceHu(amount, currency = "HUF") {
  const formatted = amount.toLocaleString("hu-HU");
  return currency === "HUF" ? `${formatted} Ft` : `${formatted} ${currency}`;
}
function formatTotalRooms(rooms, halfRooms) {
  if (halfRooms > 0) return `${rooms}+${halfRooms}`;
  return String(rooms);
}
function slugify(text6) {
  const charMap = {
    \u00E1: "a",
    \u00E9: "e",
    \u00ED: "i",
    \u00F3: "o",
    \u00F6: "o",
    \u0151: "o",
    \u00FA: "u",
    \u00FC: "u",
    \u0171: "u",
    \u00C1: "a",
    \u00C9: "e",
    \u00CD: "i",
    \u00D3: "o",
    \u00D6: "o",
    \u0150: "o",
    \u00DA: "u",
    \u00DC: "u",
    \u0170: "u"
  };
  return text6.split("").map((c) => charMap[c] || c).join("").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function generatePropertySlug(property) {
  const typeSlug = slugify(getSubCategoryLabel(property.subCategory));
  const citySlug = slugify(property.city);
  const parts = [property.listingType, typeSlug, citySlug];
  if (property.area > 0) parts.push(`${property.area}nm`);
  parts.push(property.id);
  return parts.join("-");
}

// server/ingatlan-feed-fields.ts
var IF9_FIELD_DEFINITIONS = [
  {
    code: "adat_1",
    labelHu: "\xC1llapot",
    labelEn: "Condition",
    type: "enum",
    valueMappings: {
      "302": "\xDAj\xE9p\xEDt\xE9s\u0171",
      "1": "\xDAjszer\u0171",
      "4": "Bek\xF6lt\xF6zhet\u0151",
      "7": "\xC9p\xEDt\xE9s alatt",
      "2": "Fel\xFAj\xEDtott",
      "3": "J\xF3 \xE1llapot\xFA",
      "5": "K\xF6zepes \xE1llapot\xFA",
      "6": "Fel\xFAj\xEDtand\xF3"
    }
  },
  {
    code: "adat_2",
    labelHu: "Komfort",
    labelEn: "Comfort level",
    type: "enum",
    valueMappings: {
      "9": "Komfort n\xE9lk\xFCli",
      "10": "F\xE9lkomfortos",
      "11": "Komfortos",
      "12": "\xD6sszkomfortos",
      "13": "Duplakomfortos",
      "14": "Luxus"
    }
  },
  {
    code: "adat_3",
    labelHu: "Emelet",
    labelEn: "Floor",
    type: "enum",
    valueMappings: {
      "159": "Alagsor",
      "160": "Szuter\xE9n",
      "161": "F\xF6ldszint",
      "162": "F\xE9lemelet",
      "163": "1. emelet",
      "164": "2. emelet",
      "165": "3. emelet",
      "166": "4. emelet",
      "167": "5. emelet",
      "168": "6. emelet",
      "169": "7. emelet",
      "170": "8. emelet",
      "171": "9. emelet",
      "172": "10. emelet",
      "173": "10. emelet felett"
    }
  },
  {
    code: "adat_5",
    labelHu: "Szintek sz\xE1ma",
    labelEn: "Number of floors",
    type: "number",
    unit: "szint"
  },
  {
    code: "adat_7",
    labelHu: "F\u0171t\xE9s",
    labelEn: "Heating",
    type: "enum",
    valueMappings: {
      "15": "G\xE1z (h\xE9ra)",
      "16": "Elektromos",
      "17": "G\xE1z (cirk\xF3)",
      "18": "G\xE1z (kaz\xE1n)",
      "19": "K\xF6zponti",
      "20": "Geotermikus",
      "21": "T\xE1vf\u0171t\xE9s (egyedi m\xE9r\xE9ssel)",
      "22": "T\xE1vf\u0171t\xE9s",
      "358": "Padl\xF3f\u0171t\xE9s",
      "359": "Egy\xE9b",
      "360": "H\xE1zk\xF6zponti",
      "361": "H\xE1zk\xF6zponti (egyedi m\xE9r\xE9ssel)",
      "362": "Fan-coil",
      "363": "Meg\xFAjul\xF3 energia"
    }
  },
  {
    code: "adat_8",
    labelHu: "Kil\xE1t\xE1s",
    labelEn: "View",
    type: "enum",
    valueMappings: {
      "23": "Utcai",
      "24": "Udvari",
      "25": "Kertre n\xE9z\u0151",
      "26": "Panor\xE1m\xE1s"
    }
  },
  {
    code: "adat_9",
    labelHu: "Parkol\xE1s",
    labelEn: "Parking",
    type: "multi-enum",
    valueMappings: {
      "27": "Gar\xE1zs",
      "28": "Teremgar\xE1zs",
      "29": "Utc\xE1n",
      "30": "Udvaron",
      "31": "Gar\xE1zs + aut\xF3be\xE1ll\xF3",
      "32": "Aut\xF3be\xE1ll\xF3",
      "33": "Parkol\xF3 az utc\xE1n",
      "34": "Nincs"
    }
  },
  {
    code: "adat_10",
    labelHu: "F\xFCrd\u0151szoba \xE9s WC",
    labelEn: "Bathroom and WC",
    type: "enum",
    valueMappings: {
      "35": "K\xFCl\xF6n WC",
      "36": "\xD6sszenyitott",
      "37": "K\xFCl\xF6n WC \xE9s \xF6sszenyitott is"
    }
  },
  {
    code: "adat_12",
    labelHu: "T\xE1jol\xE1s",
    labelEn: "Orientation",
    type: "multi-enum",
    valueMappings: {
      "39": "\xC9szaki",
      "40": "\xC9szakkeleti",
      "41": "Keleti",
      "42": "D\xE9lkeleti",
      "43": "D\xE9li",
      "44": "D\xE9lnyugati",
      "45": "Nyugati",
      "46": "\xC9szaknyugati"
    }
  },
  {
    code: "adat_14",
    labelHu: "H\xE1ny szob\xE1s",
    labelEn: "Room type",
    type: "enum",
    valueMappings: {
      "48": "1 szob\xE1s",
      "49": "1+1 szob\xE1s",
      "50": "1+2 szob\xE1s",
      "51": "2 szob\xE1s",
      "52": "2+1 szob\xE1s",
      "53": "2+2 szob\xE1s"
    }
  },
  {
    code: "adat_16",
    labelHu: "Pince",
    labelEn: "Basement",
    type: "enum",
    valueMappings: {
      "57": "Van",
      "58": "Nincs"
    }
  },
  {
    code: "adat_18",
    labelHu: "Szerkezet",
    labelEn: "Structure",
    type: "enum",
    valueMappings: {
      "54": "T\xE9gla",
      "55": "Ytong",
      "56": "V\xE1lyog",
      "365": "Fa",
      "366": "K\xF6nny\u0171szerkezetes",
      "367": "Egy\xE9b"
    }
  },
  {
    code: "adat_19",
    labelHu: "K\xF6z\xF6s k\xF6lts\xE9g",
    labelEn: "Common charge",
    type: "number",
    unit: "Ft/h\xF3"
  },
  {
    code: "adat_20",
    labelHu: "Tet\u0151",
    labelEn: "Roof",
    type: "enum",
    valueMappings: {
      "61": "Cser\xE9p",
      "62": "Pala",
      "63": "B\xE1doglemez / Trap\xE9zlemez",
      "64": "Bitumenes",
      "65": "Zsindely",
      "66": "Betonlemez",
      "67": "Egy\xE9b"
    }
  },
  {
    code: "adat_21",
    labelHu: "Szigetel\xE9s",
    labelEn: "Insulation",
    type: "multi-enum",
    valueMappings: {
      "68": "Nincs",
      "69": "R\xE9szleges",
      "70": "Teljes homlokzati",
      "71": "Bels\u0151"
    }
  },
  {
    code: "adat_22",
    labelHu: "Kert kapcsolatos",
    labelEn: "Garden connected",
    type: "enum",
    valueMappings: {
      "300": "Igen",
      "301": "Nem"
    }
  },
  {
    code: "adat_23",
    labelHu: "Villany",
    labelEn: "Electricity",
    type: "enum",
    valueMappings: {
      "72": "Van",
      "73": "Nincs",
      "74": "Utc\xE1ban van"
    }
  },
  {
    code: "adat_24",
    labelHu: "V\xEDz",
    labelEn: "Water supply",
    type: "enum",
    valueMappings: {
      "75": "Van",
      "76": "Nincs",
      "77": "Utc\xE1ban van",
      "78": "Saj\xE1t k\xFAt"
    }
  },
  {
    code: "adat_25",
    labelHu: "G\xE1z",
    labelEn: "Gas supply",
    type: "enum",
    valueMappings: {
      "79": "Van",
      "80": "Nincs",
      "81": "Utc\xE1ban van"
    }
  },
  {
    code: "adat_26",
    labelHu: "Csatorna",
    labelEn: "Sewage",
    type: "enum",
    valueMappings: {
      "82": "Van",
      "83": "Nincs",
      "84": "Utc\xE1ban van",
      "85": "Szikkaszt\xF3 / Der\xEDt\u0151"
    }
  },
  {
    code: "adat_27",
    labelHu: "Telekter\xFClet",
    labelEn: "Lot size",
    type: "number",
    unit: "m\xB2"
  },
  {
    code: "adat_28",
    labelHu: "Sz\u0151l\u0151",
    labelEn: "Vineyard",
    type: "number",
    unit: "m\xB2"
  },
  {
    code: "adat_29",
    labelHu: "Gy\xFCm\xF6lcs\xF6s",
    labelEn: "Orchard",
    type: "number",
    unit: "m\xB2"
  },
  {
    code: "adat_30",
    labelHu: "Burkolat",
    labelEn: "Flooring",
    type: "multi-enum",
    valueMappings: {
      "86": "Parketta",
      "87": "Lamin\xE1lt parketta",
      "88": "J\xE1r\xF3lap / csempe",
      "89": "K\u0151lap / Gr\xE1nit",
      "90": "Sz\u0151nyeg",
      "91": "PVC / Lin\xF3leum",
      "92": "Haj\xF3padl\xF3 / Deszka",
      "93": "Egy\xE9b",
      "102": "Vegyes"
    }
  },
  {
    code: "adat_31",
    labelHu: "Ny\xEDl\xE1sz\xE1r\xF3",
    labelEn: "Window type",
    type: "multi-enum",
    valueMappings: {
      "94": "Fa",
      "95": "M\u0171anyag",
      "96": "Alum\xEDnium",
      "97": "Egy\xE9b",
      "103": "Fa \xE9s m\u0171anyag"
    }
  },
  {
    code: "adat_32",
    labelHu: "Red\u0151ny / \xC1rny\xE9kol\xE1s",
    labelEn: "Blinds / Shading",
    type: "multi-enum",
    valueMappings: {
      "98": "Red\u0151ny",
      "99": "Zsalug\xE1ter",
      "100": "\xC1rny\xE9kol\xF3",
      "101": "Spaletta",
      "110": "Nincs"
    }
  },
  {
    code: "adat_33",
    labelHu: "L\xE9gtechnikai rendszer",
    labelEn: "Ventilation system",
    type: "multi-enum",
    valueMappings: {
      "104": "Kl\xEDma",
      "105": "Szell\u0151z\u0151",
      "106": "H\u0151cser\xE9l\u0151s szell\u0151z\xE9s",
      "107": "K\xF6zponti kl\xEDma",
      "108": "Split kl\xEDma",
      "109": "P\xE1r\xE1tlan\xEDt\xF3"
    }
  },
  {
    code: "adat_34",
    labelHu: "Biztons\xE1gi felszerel\xE9sek",
    labelEn: "Security features",
    type: "multi-enum",
    valueMappings: {
      "111": "Kaputelefon",
      "112": "Riaszt\xF3",
      "113": "Biztons\xE1gi kamera",
      "114": "Biztons\xE1gi bej\xE1rati ajt\xF3",
      "325": "T\xE1vfel\xFCgyelet"
    }
  },
  {
    code: "adat_35",
    labelHu: "Egy\xE9b felszerelts\xE9g",
    labelEn: "Equipment",
    type: "multi-enum",
    valueMappings: {
      "115": "B\xFAtorozatlan",
      "116": "R\xE9szben b\xFAtorozott",
      "117": "Teljesen b\xFAtorozott",
      "118": "G\xE9pes\xEDtett konyha",
      "119": "Be\xE9p\xEDtett szekr\xE9ny",
      "120": "Mosogat\xF3g\xE9p",
      "121": "Mos\xF3g\xE9p",
      "122": "Sz\xE1r\xEDt\xF3g\xE9p",
      "123": "H\u0171t\u0151",
      "124": "Mikrohull\xE1m\xFA s\xFCt\u0151",
      "329": "Elektromos t\u0171zhely",
      "330": "G\xE1zt\u0171zhely",
      "331": "Bojler",
      "339": "Egy\xE9b"
    }
  },
  {
    code: "adat_36",
    labelHu: "Konyha t\xEDpusa",
    labelEn: "Kitchen type",
    type: "enum",
    valueMappings: {
      "125": "K\xFCl\xF6n\xE1ll\xF3",
      "126": "Amerikai konyh\xE1s",
      "127": "\xC9tkez\u0151s konyha",
      "128": "Teakonyha"
    }
  },
  {
    code: "adat_37",
    labelHu: "Energiatan\xFAs\xEDtv\xE1ny",
    labelEn: "Energy certificate",
    type: "enum",
    valueMappings: {
      "129": "AA++",
      "130": "AA+",
      "131": "AA",
      "132": "BB",
      "133": "CC",
      "134": "DD",
      "135": "EE",
      "136": "FF",
      "137": "GG",
      "138": "HH",
      "139": "II",
      "140": "JJ",
      "147": "Nem rendelkezik",
      "148": "Folyamatban"
    }
  },
  {
    code: "adat_38",
    labelHu: "Internet",
    labelEn: "Internet",
    type: "multi-enum",
    valueMappings: {
      "141": "Optikai k\xE1bel",
      "142": "DSL / ADSL",
      "143": "K\xE1bel TV h\xE1l\xF3zat",
      "144": "Nincs",
      "145": "Wifi",
      "146": "Egy\xE9b"
    }
  },
  {
    code: "adat_39",
    labelHu: "Erk\xE9ly / Terasz m\xE9rete",
    labelEn: "Balcony / Terrace size",
    type: "number",
    unit: "m\xB2"
  },
  {
    code: "adat_40",
    labelHu: "\xC9p\xFClet szintjeinek sz\xE1ma",
    labelEn: "Building total floors",
    type: "number"
  },
  {
    code: "adat_41",
    labelHu: "Lak\xE1sok sz\xE1ma az \xE9p\xFCletben",
    labelEn: "Number of apartments in building",
    type: "number"
  },
  {
    code: "adat_42",
    labelHu: "Bels\u0151 \xE1llapot",
    labelEn: "Interior condition",
    type: "enum",
    valueMappings: {
      "149": "\xDAjszer\u0171",
      "150": "Fel\xFAj\xEDtott",
      "151": "J\xF3 \xE1llapot\xFA",
      "152": "K\xF6zepes \xE1llapot\xFA",
      "153": "Fel\xFAj\xEDtand\xF3"
    }
  },
  {
    code: "adat_43",
    labelHu: "K\xFCls\u0151 \xE1llapot",
    labelEn: "Exterior condition",
    type: "enum",
    valueMappings: {
      "154": "\xDAjszer\u0171",
      "155": "Fel\xFAj\xEDtott",
      "156": "J\xF3 \xE1llapot\xFA",
      "157": "K\xF6zepes \xE1llapot\xFA",
      "158": "Fel\xFAj\xEDtand\xF3"
    }
  },
  {
    code: "adat_44",
    labelHu: "Lift",
    labelEn: "Elevator",
    type: "enum",
    valueMappings: {
      "176": "Van",
      "177": "Nincs"
    }
  },
  {
    code: "adat_82",
    labelHu: "K\xF6zm\u0171vel\u0151d\xE9si hozz\xE1j\xE1rul\xE1s",
    labelEn: "Utility contribution",
    type: "number",
    unit: "Ft"
  },
  {
    code: "adat_83",
    labelHu: "Haszn\xE1latba v\xE9teli enged\xE9ly",
    labelEn: "Occupancy permit",
    type: "enum",
    valueMappings: {
      "1": "Van"
    }
  },
  {
    code: "adat_84",
    labelHu: "Belmagass\xE1g",
    labelEn: "Ceiling height",
    type: "enum",
    valueMappings: {
      "294": "3 m\xE9ter felett",
      "295": "3 m\xE9ter alatt"
    }
  },
  {
    code: "adat_85",
    labelHu: "WC \xE9s f\xFCrd\u0151szoba",
    labelEn: "WC and bathroom",
    type: "enum",
    valueMappings: {
      "296": "K\xFCl\xF6n helyis\xE9gben",
      "297": "Egy helyis\xE9gben",
      "298": "K\xFCl\xF6n is, egyben is"
    }
  },
  {
    code: "adat_86",
    labelHu: "Kertkapcsolatos",
    labelEn: "Garden connected",
    type: "enum",
    valueMappings: {
      "300": "Igen",
      "301": "Nem"
    }
  },
  {
    code: "adat_87",
    labelHu: "Tet\u0151t\xE9r",
    labelEn: "Attic",
    type: "enum",
    valueMappings: {
      "303": "Tet\u0151t\xE9ri",
      "304": "Nem tet\u0151t\xE9ri",
      "305": "Tet\u0151t\xE9ri, de be\xE9p\xEDthet\u0151"
    }
  },
  {
    code: "adat_88",
    labelHu: "Parkol\xE1s benne van az \xE1rban",
    labelEn: "Parking included in price",
    type: "boolean",
    valueMappings: {
      "1": "Igen"
    }
  },
  {
    code: "adat_89",
    labelHu: "\xC9p\xEDt\xE9s \xE9ve",
    labelEn: "Year built",
    type: "number",
    unit: "\xE9v"
  },
  {
    code: "adat_90",
    labelHu: "K\xF6lt\xF6zhet\u0151",
    labelEn: "Move-in availability",
    type: "enum",
    valueMappings: {
      "309": "Azonnal",
      "310": "Kevesebb mint 3 h\xF3napon bel\xFCl"
    }
  },
  {
    code: "adat_91",
    labelHu: "Tulajdonjog / B\xE9rleti jog",
    labelEn: "Ownership / Lease right",
    type: "enum",
    valueMappings: {
      "311": "Tulajdonjog",
      "312": "B\xE9rleti jog"
    }
  },
  {
    code: "adat_93",
    labelHu: "Honnan ny\xEDlik",
    labelEn: "Entry from",
    type: "enum",
    valueMappings: {
      "317": "Utc\xE1r\xF3l",
      "318": "Udvarr\xF3l",
      "319": "L\xE9pcs\u0151h\xE1zb\xF3l",
      "320": "Folyos\xF3r\xF3l",
      "321": "Gangr\xF3l"
    }
  },
  {
    code: "adat_94",
    labelHu: "Panelprogram",
    labelEn: "Panel renovation program",
    type: "enum",
    valueMappings: {
      "322": "R\xE9szt vett",
      "323": "Nem vett r\xE9szt"
    }
  },
  {
    code: "adat_95",
    labelHu: "CSOK",
    labelEn: "CSOK subsidy",
    type: "enum",
    valueMappings: {
      "347": "Igen",
      "348": "Nem"
    }
  },
  {
    code: "adat_96",
    labelHu: "Napkollektor",
    labelEn: "Solar collector",
    type: "enum",
    valueMappings: {
      "349": "Van",
      "350": "Nincs"
    }
  },
  {
    code: "adat_97",
    labelHu: "Napelemrendszer",
    labelEn: "Solar panel system",
    type: "enum",
    valueMappings: {
      "351": "Van",
      "352": "Nincs"
    }
  },
  {
    code: "adat_98",
    labelHu: "Erk\xE9ly",
    labelEn: "Balcony",
    type: "enum",
    valueMappings: {
      "353": "Igen",
      "354": "Nem"
    }
  },
  {
    code: "adat_99",
    labelHu: "Akad\xE1lymentes\xEDtett",
    labelEn: "Wheelchair accessible",
    type: "enum",
    valueMappings: {
      "355": "Igen",
      "356": "Nem"
    }
  },
  {
    code: "adat_100",
    labelHu: "Z\xF6ld otthon",
    labelEn: "Green home",
    type: "enum",
    valueMappings: {
      "1": "Igen"
    }
  },
  {
    code: "adat_101",
    labelHu: "Okosotthon",
    labelEn: "Smart home",
    type: "enum",
    valueMappings: {
      "1": "Igen"
    }
  },
  {
    code: "adat_102",
    labelHu: "F\xFCrd\u0151szoba sz\xE1ma",
    labelEn: "Number of bathrooms",
    type: "number",
    unit: "db"
  },
  {
    code: "adat_103",
    labelHu: "WC-k sz\xE1ma",
    labelEn: "Number of toilets",
    type: "number",
    unit: "db"
  },
  {
    code: "adat_106",
    labelHu: "Hasznos alapter\xFClet",
    labelEn: "Usable area",
    type: "number",
    unit: "m\xB2"
  },
  {
    code: "adat_107",
    labelHu: "Megtekinthet\u0151",
    labelEn: "Viewable",
    type: "boolean",
    valueMappings: {
      "1": "Igen"
    }
  },
  {
    code: "adat_108",
    labelHu: "CSOK-ra alkalmas",
    labelEn: "Eligible for CSOK subsidy",
    type: "boolean",
    valueMappings: {
      "1": "Igen"
    }
  }
];
var IF9_FIELD_MAP = new Map(
  IF9_FIELD_DEFINITIONS.map((def) => [def.code, def])
);
function decodeAdatFields(rawAttrs) {
  const features = {};
  for (const [code, rawValue] of Object.entries(rawAttrs)) {
    const def = IF9_FIELD_MAP.get(code);
    if (!def) {
      features[code] = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue;
      continue;
    }
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    switch (def.type) {
      case "number":
        features[def.labelHu] = parseInt(value, 10) || 0;
        break;
      case "boolean":
        features[def.labelHu] = value === "1";
        break;
      case "enum":
      case "multi-enum": {
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        const decoded = values.map((v) => def.valueMappings?.[v] ?? `#${v}`).join(", ");
        features[def.labelHu] = decoded;
        break;
      }
      default:
        features[def.labelHu] = value;
    }
  }
  return features;
}

// server/ingatlan-feed.ts
function log(level, event, data) {
  const entry = {
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    module: "ingatlan-feed",
    event,
    ...data
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}
function extractImages(kepek) {
  if (!kepek) return [];
  if (typeof kepek === "object" && kepek !== null) {
    const obj = kepek;
    if (obj.kep) {
      const kep = obj.kep;
      if (Array.isArray(kep)) return kep.map(String).filter(Boolean);
      if (typeof kep === "string") return [kep];
    }
  }
  return [];
}
function getCdataText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value !== null) {
    const obj = value;
    if (obj.__cdata) return String(obj.__cdata).trim();
  }
  return String(value).trim();
}
function getAdatFields(raw) {
  const attrs = {};
  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith("adat_")) {
      if (Array.isArray(val)) {
        attrs[key] = val.map(String);
      } else {
        attrs[key] = String(val);
      }
    }
  }
  return attrs;
}
var xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  isArray: (name) => name === "ingatlan" || name === "kep" || name === "ertekesito",
  trimValues: true,
  cdataPropName: "__cdata",
  processEntities: false
});
function parseFeedXml(xmlString) {
  const errors = [];
  const parseStart = Date.now();
  let parsed;
  try {
    parsed = xmlParser.parse(xmlString);
  } catch (err) {
    const msg = `XML parse failed: ${err instanceof Error ? err.message : String(err)}`;
    log("error", "xml_parse_failed", { error: msg });
    return {
      office: { name: "", email: "", phone: "", address: "", web: "" },
      properties: [],
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      propertyCount: 0,
      errors: [msg]
    };
  }
  const root = parsed.xml || parsed;
  const rootObj = root;
  const irodaRaw = rootObj.iroda || {};
  const office = {
    name: String(irodaRaw.nev || "").trim(),
    email: String(irodaRaw.email || "").trim(),
    phone: String(irodaRaw.telefon || "").trim(),
    address: String(irodaRaw.cim || "").trim(),
    web: String(irodaRaw.web || "").trim()
  };
  const ingatlanokContainer = rootObj.ingatlanok;
  const ingatlanokRaw = ingatlanokContainer?.ingatlan || [];
  const rawList = Array.isArray(ingatlanokRaw) ? ingatlanokRaw : [ingatlanokRaw];
  const properties = [];
  let skippedCount = 0;
  for (const raw of rawList) {
    try {
      const validated = RawIngatlanSchema.safeParse(raw);
      if (!validated.success) {
        const errMsg = `Property validation failed: ${validated.error.issues.map((i) => i.message).join("; ")}`;
        errors.push(errMsg);
        skippedCount++;
        continue;
      }
      const data = validated.data;
      const rawAttrs = getAdatFields(raw);
      const listingType = mapKategoriaToListingType(data.kategoria);
      const category = mapTipusToCategory(data.tipus);
      const subCategory = mapAltipusToSubCategory(data.altipus);
      const typeCode = subCategoryToTypeCode(subCategory);
      const typeLabel = getSubCategoryLabel(subCategory);
      log("info", "property_type_debug", {
        propertyId: data.id,
        altipus: data.altipus,
        subCategory,
        typeLabel,
        adat_85_raw: rawAttrs.adat_85
      });
      const city = data.telepules || "Ismeretlen";
      const area = data.alapterulet;
      const images = extractImages(data.kepek);
      const description = getCdataText(data.leiras);
      const features = decodeAdatFields(rawAttrs);
      const builtYear = rawAttrs.adat_89 ? parseInt(String(rawAttrs.adat_89), 10) || void 0 : void 0;
      const lotSize = rawAttrs.adat_27 ? parseInt(String(rawAttrs.adat_27), 10) || void 0 : void 0;
      const statusLabel = listingType === "elado" ? "Elad\xF3" : "Kiad\xF3";
      const title = data.nev?.trim() || `${statusLabel} ${typeLabel} - ${city}`;
      const rooms = data.szobaszam;
      const halfRooms = data.felszobaszam;
      const slug = generatePropertySlug({
        id: data.id,
        listingType,
        subCategory,
        city,
        area
      });
      const property = {
        id: data.id,
        slug,
        listingType,
        category,
        subCategory,
        title,
        price: data.ar,
        priceFormatted: formatPriceHu(data.ar, data.penznem),
        currency: data.penznem,
        area,
        rooms,
        halfRooms,
        totalRooms: formatTotalRooms(rooms, halfRooms),
        address: {
          zip: data.irszam,
          city,
          district: data.telepulesresz,
          street: data.utca
        },
        description,
        images,
        thumbnailUrl: images[0] || "",
        builtYear,
        lotSize,
        features,
        featured: false,
        videoUrl: data.video || void 0
      };
      properties.push(property);
    } catch (err) {
      const errMsg = `Property processing error: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(errMsg);
      skippedCount++;
    }
  }
  const parseMs = Date.now() - parseStart;
  log("info", "xml_parsed", {
    propertyCount: properties.length,
    skippedCount,
    errorCount: errors.length,
    parseMs,
    xmlBytes: xmlString.length
  });
  return {
    office,
    properties,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    propertyCount: properties.length,
    errors
  };
}
var cachedResult = null;
var lastFetchTime = 0;
var fetchCount = 0;
var cacheHitCount = 0;
var CACHE_TTL_MS = 60 * 60 * 1e3;
async function fetchFeed(feedUrl, options) {
  const now = Date.now();
  const forceRefresh = options?.forceRefresh ?? false;
  const timeoutMs = options?.timeoutMs ?? 3e4;
  if (!forceRefresh && cachedResult && now - lastFetchTime < CACHE_TTL_MS) {
    cacheHitCount++;
    log("info", "cache_hit", {
      cacheAgeMs: now - lastFetchTime,
      cacheHitCount,
      propertyCount: cachedResult.propertyCount
    });
    return cachedResult;
  }
  fetchCount++;
  const fetchStart = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    log("info", "fetch_start", { fetchCount, forceRefresh, timeoutMs });
    const response = await fetch(feedUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Feed HTTP ${response.status}: ${response.statusText}`);
    }
    const xmlString = await response.text();
    const fetchMs = Date.now() - fetchStart;
    log("info", "fetch_complete", {
      fetchMs,
      bytes: xmlString.length,
      fetchCount
    });
    const result = parseFeedXml(xmlString);
    if (result.errors.length > 0) {
      log("warn", "parse_warnings", { errors: result.errors });
    }
    cachedResult = result;
    lastFetchTime = now;
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const fetchMs = Date.now() - fetchStart;
    const isTimeout = message.includes("abort");
    log("error", "fetch_failed", {
      error: message,
      fetchMs,
      isTimeout,
      fetchCount,
      hasStaleCacheAge: lastFetchTime > 0 ? now - lastFetchTime : null
    });
    if (cachedResult) {
      const staleCacheAgeMs = now - lastFetchTime;
      log("warn", "serving_stale_cache", { staleCacheAgeMs });
      return {
        ...cachedResult,
        errors: [...cachedResult.errors, `Stale data (fetch failed: ${message})`]
      };
    }
    return {
      office: { name: "", email: "", phone: "", address: "", web: "" },
      properties: [],
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      propertyCount: 0,
      errors: [`Feed unavailable: ${message}`]
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
function getFeedStatus() {
  return {
    cached: cachedResult !== null,
    lastFetchTime: lastFetchTime > 0 ? new Date(lastFetchTime).toISOString() : null,
    cacheAgeMs: lastFetchTime > 0 ? Date.now() - lastFetchTime : null,
    cacheTtlMs: CACHE_TTL_MS,
    propertyCount: cachedResult?.propertyCount ?? 0,
    errors: cachedResult?.errors ?? [],
    stats: {
      totalFetches: fetchCount,
      cacheHits: cacheHitCount
    }
  };
}

// server/routes/admin/dashboard.ts
var router7 = Router7();
router7.use(requireRole("admin", "editor", "viewer"));
router7.get("/stats", async (_req, res) => {
  try {
    const now = /* @__PURE__ */ new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1e3);
    let activeProperties = 0;
    const xmlUrl = process.env.INGATLAN_XML_URL;
    if (xmlUrl) {
      try {
        const feed = await fetchFeed(xmlUrl);
        activeProperties = feed.propertyCount;
      } catch {
        activeProperties = 0;
      }
    }
    const [
      [{ subscriberCount }],
      [{ todayEventsCount }],
      [{ activeStaffCount }]
    ] = await Promise.all([
      db.select({ subscriberCount: count4() }).from(newsletterSubscribers).where(eq8(newsletterSubscribers.status, "confirmed")),
      db.select({ todayEventsCount: count4() }).from(calendarEvents).where(
        and8(
          gte3(calendarEvents.startDatetime, todayStart),
          lte3(calendarEvents.startDatetime, todayEnd)
        )
      ),
      db.select({ activeStaffCount: count4() }).from(staff).where(eq8(staff.active, true))
    ]);
    res.json({
      activeProperties,
      subscriberCount,
      todayEventsCount,
      activeStaffCount
    });
  } catch (error) {
    console.error("[admin/dashboard/stats] Error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a statisztik\xE1k lek\xE9rdez\xE9sekor." });
  }
});
router7.get("/activity", async (_req, res) => {
  try {
    const now = /* @__PURE__ */ new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowEnd = new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1e3);
    const [recentSubscribers, upcomingEvents, recentEdits] = await Promise.all([
      db.select({
        id: newsletterSubscribers.id,
        email: newsletterSubscribers.email,
        name: newsletterSubscribers.name,
        status: newsletterSubscribers.status,
        subscribedAt: newsletterSubscribers.subscribedAt
      }).from(newsletterSubscribers).orderBy(desc3(newsletterSubscribers.subscribedAt)).limit(5),
      db.select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        startDatetime: calendarEvents.startDatetime,
        endDatetime: calendarEvents.endDatetime,
        eventType: calendarEvents.eventType,
        location: calendarEvents.location,
        color: calendarEvents.color
      }).from(calendarEvents).where(
        and8(
          gte3(calendarEvents.startDatetime, todayStart),
          lte3(calendarEvents.startDatetime, tomorrowEnd)
        )
      ).orderBy(calendarEvents.startDatetime).limit(10),
      db.select({
        id: activityLog.id,
        action: activityLog.action,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        details: activityLog.details,
        createdAt: activityLog.createdAt
      }).from(activityLog).where(sql6`${activityLog.action} LIKE '%content%'`).orderBy(desc3(activityLog.createdAt)).limit(5)
    ]);
    res.json({
      recentSubscribers,
      upcomingEvents,
      recentEdits
    });
  } catch (error) {
    console.error("[admin/dashboard/activity] Error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt az aktivit\xE1s lek\xE9rdez\xE9sekor." });
  }
});
var dashboard_default = router7;

// server/routes/admin/featured.ts
import { Router as Router8 } from "express";
import { z as z8 } from "zod";
import { eq as eq9, asc, and as and9 } from "drizzle-orm";
var MAX_FEATURED = 6;
var INGATLAN_XML_URL = process.env.INGATLAN_XML_URL;
var router8 = Router8();
router8.use(requireRole("admin", "editor"));
router8.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(featuredProperties).where(eq9(featuredProperties.isFeatured, true)).orderBy(asc(featuredProperties.featuredOrder));
    res.json({ featured: rows });
  } catch (error) {
    console.error("[admin/featured] List error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a kiemelt ingatlanok lek\xE9rdez\xE9sekor." });
  }
});
var toggleSchema = z8.object({
  propertyId: z8.string().min(1).max(255)
});
router8.post("/", async (req, res) => {
  try {
    const result = toggleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    const { propertyId } = result.data;
    if (INGATLAN_XML_URL) {
      const feed = await fetchFeed(INGATLAN_XML_URL);
      const exists = feed.properties.some((p) => p.id === propertyId);
      if (!exists) {
        return res.status(404).json({ error: "Az ingatlan nem tal\xE1lhat\xF3 a feedben." });
      }
    }
    const [existing] = await db.select().from(featuredProperties).where(eq9(featuredProperties.propertyId, propertyId)).limit(1);
    if (existing?.isFeatured) {
      const [updated] = await db.update(featuredProperties).set({ isFeatured: false }).where(eq9(featuredProperties.id, existing.id)).returning();
      await db.insert(activityLog).values({
        userId: req.user?.id ?? null,
        action: "featured_removed",
        entityType: "property",
        entityId: propertyId
      });
      return res.json({ featured: false, record: updated });
    }
    const currentCount = await db.select().from(featuredProperties).where(eq9(featuredProperties.isFeatured, true));
    if (currentCount.length >= MAX_FEATURED) {
      return res.status(409).json({
        error: `Legfeljebb ${MAX_FEATURED} ingatlan jel\xF6lhet\u0151 ki kiemeltk\xE9nt.`
      });
    }
    const nextOrder = currentCount.length > 0 ? Math.max(...currentCount.map((r) => r.featuredOrder ?? 0)) + 1 : 0;
    let record;
    if (existing) {
      [record] = await db.update(featuredProperties).set({ isFeatured: true, featuredOrder: nextOrder, featuredBy: req.user?.id ?? null }).where(eq9(featuredProperties.id, existing.id)).returning();
    } else {
      [record] = await db.insert(featuredProperties).values({
        propertyId,
        isFeatured: true,
        featuredOrder: nextOrder,
        featuredBy: req.user?.id ?? null
      }).returning();
    }
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "featured_added",
      entityType: "property",
      entityId: propertyId
    });
    res.json({ featured: true, record });
  } catch (error) {
    console.error("[admin/featured] Toggle error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a kiemelt st\xE1tusz m\xF3dos\xEDt\xE1sakor." });
  }
});
var reorderSchema = z8.object({
  propertyIds: z8.array(z8.string().min(1).max(255)).min(1).max(MAX_FEATURED)
});
router8.put("/reorder", async (req, res) => {
  try {
    const result = reorderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    const { propertyIds } = result.data;
    const updates = propertyIds.map(
      (pid, index5) => db.update(featuredProperties).set({ featuredOrder: index5 }).where(
        and9(
          eq9(featuredProperties.propertyId, pid),
          eq9(featuredProperties.isFeatured, true)
        )
      )
    );
    await Promise.all(updates);
    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "featured_reordered",
      entityType: "property",
      entityId: propertyIds.join(",")
    });
    const rows = await db.select().from(featuredProperties).where(eq9(featuredProperties.isFeatured, true)).orderBy(asc(featuredProperties.featuredOrder));
    res.json({ featured: rows });
  } catch (error) {
    console.error("[admin/featured] Reorder error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a sorrend m\xF3dos\xEDt\xE1sakor." });
  }
});
var featured_default = router8;

// server/routes/content.ts
import { Router as Router9 } from "express";
import { eq as eq10 } from "drizzle-orm";
import { z as z9 } from "zod";
var router9 = Router9();
function extractBilingualFallback(content, lang) {
  const otherLang = lang === "hu" ? "en" : "hu";
  const langPrefix = `{"${lang}":"`;
  const otherPrefix = `{"${otherLang}":"`;
  const langDelim = `","${lang}":"`;
  const otherDelim = `","${otherLang}":"`;
  if (content.startsWith(langPrefix)) {
    const valueStart = langPrefix.length;
    const delimIdx = content.lastIndexOf(otherDelim);
    if (delimIdx > valueStart) {
      return content.slice(valueStart, delimIdx);
    }
    if (content.endsWith('"}')) {
      return content.slice(valueStart, content.length - 2);
    }
  }
  if (content.startsWith(otherPrefix)) {
    const delimIdx = content.lastIndexOf(langDelim);
    if (delimIdx !== -1) {
      const valueStart = delimIdx + langDelim.length;
      if (content.endsWith('"}')) {
        return content.slice(valueStart, content.length - 2);
      }
    }
    if (lang !== "hu") {
      return extractBilingualFallback(content, "hu");
    }
  }
  return null;
}
var pagePathSchema = z9.string().max(255).regex(/^[a-zA-Z0-9/_-]*$/);
router9.get("/{*pagePath}", async (req, res) => {
  try {
    const paramValue = req.params.pagePath;
    const raw = (Array.isArray(paramValue) ? paramValue.join("/") : paramValue || "").replace(/^\/+/, "");
    const parsed = pagePathSchema.safeParse(raw);
    if (!parsed.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen oldal \xFAtvonal." });
    }
    const pagePath = parsed.data ? `/${parsed.data}` : "/";
    const blocks = await db.select({
      blockKey: contentBlocks.blockKey,
      content: contentBlocks.content,
      contentType: contentBlocks.contentType
    }).from(contentBlocks).where(eq10(contentBlocks.pagePath, pagePath));
    const lang = req.query.lang === "en" ? "en" : "hu";
    const blockMap = {};
    for (const block of blocks) {
      let content = block.content;
      let contentType = block.contentType;
      for (let i = 0; i < 3 && (content.startsWith('{"hu":') || content.startsWith('{"en":')); i++) {
        try {
          const jsonContent = JSON.parse(content);
          if (typeof jsonContent === "object" && jsonContent !== null && !Array.isArray(jsonContent) && ("hu" in jsonContent || "en" in jsonContent)) {
            const langValue = jsonContent[lang] ?? jsonContent["hu"] ?? content;
            if (typeof langValue === "string") {
              content = langValue;
              contentType = "text";
            } else {
              content = JSON.stringify(langValue);
              contentType = "json-array";
            }
          } else {
            break;
          }
        } catch {
          const extracted = extractBilingualFallback(content, lang);
          if (extracted !== null) {
            content = extracted;
            contentType = "text";
          }
          break;
        }
      }
      blockMap[block.blockKey] = { content, contentType };
    }
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );
    res.json({ blocks: blockMap });
  } catch (error) {
    console.error("[api/content] Error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a tartalom bet\xF6lt\xE9sekor." });
  }
});
var content_default2 = router9;

// server/routes/newsletter.ts
import { Router as Router10 } from "express";
import { z as z10 } from "zod";
import { eq as eq11, and as and10 } from "drizzle-orm";
import rateLimit from "express-rate-limit";
var router10 = Router10();
var subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    const lang = (_req.headers["accept-language"] ?? "").includes("en") ? "en" : "hu";
    const message = lang === "en" ? "Too many attempts, please try again later." : "T\xFAl sok pr\xF3b\xE1lkoz\xE1s, k\xE9rj\xFCk pr\xF3b\xE1lja \xFAjra k\xE9s\u0151bb.";
    res.status(429).json({ error: message });
  }
});
var subscribeSchema = z10.object({
  email: z10.string().email("\xC9rv\xE9nytelen e-mail c\xEDm.").max(320),
  name: z10.string().max(255).optional(),
  gdprConsent: z10.literal(true, {
    errorMap: () => ({
      message: "Az adatkezel\xE9si hozz\xE1j\xE1rul\xE1s k\xF6telez\u0151."
    })
  })
});
router10.post("/subscribe", subscribeLimiter, async (req, res) => {
  try {
    const result = subscribeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok."
      });
    }
    const { email, name } = result.data;
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.select().from(newsletterSubscribers).where(eq11(newsletterSubscribers.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      const sub = existing[0];
      if (sub.status === "confirmed") {
        return res.json({
          success: true,
          message: "Ez az e-mail c\xEDm m\xE1r fel van iratkozva."
        });
      }
      if (sub.status === "pending") {
        return res.json({
          success: true,
          message: "M\xE1r kapt\xE1l meger\u0151s\xEDt\u0151 e-mailt. K\xE9rj\xFCk, ellen\u0151rizd a postal\xE1d\xE1dat."
        });
      }
    }
    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null;
    const userAgent = req.headers["user-agent"] ?? null;
    const [subscriber] = await db.insert(newsletterSubscribers).values({
      email: normalizedEmail,
      name: name ?? null,
      status: "pending",
      ipAddress,
      userAgent
    }).onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: {
        name: name ?? null,
        status: "pending",
        ipAddress,
        userAgent,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    const confirmUrl = `${process.env.SITE_URL ?? "https://gerecseingatlan.hu"}/api/newsletter/confirm/${subscriber.confirmationToken}`;
    await sendNewsletterConfirmationEmail({
      email: normalizedEmail,
      confirmUrl,
      name: name ?? void 0
    });
    res.json({
      success: true,
      message: "Sikeres feliratkoz\xE1s! K\xE9rj\xFCk, er\u0151s\xEDtse meg e-mail c\xEDm\xE9t a kapott lev\xE9lben."
    });
  } catch (error) {
    console.error("[newsletter/subscribe] Error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a feliratkoz\xE1s sor\xE1n." });
  }
});
router10.get("/confirm/:token", async (req, res) => {
  try {
    const tokenSchema = z10.string().uuid();
    const tokenResult = tokenSchema.safeParse(req.params.token);
    if (!tokenResult.success) {
      return res.status(400).send(confirmationPage(false, "\xC9rv\xE9nytelen meger\u0151s\xEDt\u0151 link."));
    }
    const [subscriber] = await db.update(newsletterSubscribers).set({
      status: "confirmed",
      confirmedAt: /* @__PURE__ */ new Date(),
      confirmationToken: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(
      and10(
        eq11(newsletterSubscribers.confirmationToken, tokenResult.data),
        eq11(newsletterSubscribers.status, "pending")
      )
    ).returning();
    if (!subscriber) {
      return res.status(404).send(confirmationPage(false, "A meger\u0151s\xEDt\u0151 link \xE9rv\xE9nytelen vagy m\xE1r felhaszn\xE1lt\xE1k."));
    }
    res.send(confirmationPage(true, "Sikeresen meger\u0151s\xEDtette feliratkoz\xE1s\xE1t!"));
  } catch (error) {
    console.error("[newsletter/confirm] Error:", error);
    res.status(500).send(confirmationPage(false, "Hiba t\xF6rt\xE9nt a meger\u0151s\xEDt\xE9s sor\xE1n."));
  }
});
router10.post("/unsubscribe", async (req, res) => {
  try {
    const schema = z10.object({ email: z10.string().email().max(320) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen e-mail c\xEDm." });
    }
    const normalizedEmail = result.data.email.toLowerCase().trim();
    const [updated] = await db.update(newsletterSubscribers).set({
      status: "unsubscribed",
      unsubscribedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq11(newsletterSubscribers.email, normalizedEmail)).returning();
    if (!updated) {
      return res.status(404).json({ error: "Ez az e-mail c\xEDm nem tal\xE1lhat\xF3." });
    }
    res.json({
      success: true,
      message: "Sikeresen leiratkozott a h\xEDrlev\xE9lr\u0151l."
    });
  } catch (error) {
    console.error("[newsletter/unsubscribe] Error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a leiratkoz\xE1s sor\xE1n." });
  }
});
function confirmationPage(success, message) {
  const bgColor = success ? "#E8F5E9" : "#FFEBEE";
  const textColor = success ? "#2E7D32" : "#C62828";
  return `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${success ? "Meger\u0151s\xEDtve" : "Hiba"} \u2013 Gerecse Ingatlan</title></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#F5F3EF;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:480px;margin:32px auto;padding:48px 32px;background-color:#FFFFFF;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#C5A55A;font-weight:bold;margin-bottom:24px;">G<span style="color:#1B3A5C;">I</span></div>
    <div style="padding:16px;margin-bottom:24px;background-color:${bgColor};border-radius:8px;">
      <p style="font-size:16px;color:${textColor};margin:0;font-weight:bold;">${escapeHtml(message)}</p>
    </div>
    <a href="/" style="display:inline-block;padding:12px 32px;background-color:#1B3A5C;color:#FFFFFF;text-decoration:none;font-weight:bold;border-radius:4px;">Vissza a f\u0151oldalra</a>
  </div>
</body>
</html>`;
}
var newsletter_default2 = router10;

// server/routes/calendar.ts
import { Router as Router11 } from "express";
import { z as z11 } from "zod";
import { eq as eq12, and as and11, gte as gte4 } from "drizzle-orm";
var router11 = Router11();
var EVENT_TYPE_LABELS = {
  ingatlan_megtekintes: "Ingatlan megtekint\xE9s",
  ugyfel_talalkozo: "\xDCgyf\xE9l tal\xE1lkoz\xF3",
  belso_megbeszeles: "Bels\u0151 megbesz\xE9l\xE9s",
  szabadsag: "Szabads\xE1g",
  egyeb: "Egy\xE9b"
};
function escapeIcsText2(text6) {
  return text6.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
function formatIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
router11.get("/ics/:staffId", async (req, res) => {
  try {
    const staffIdSchema = z11.string().uuid();
    const result = staffIdSchema.safeParse(req.params.staffId);
    if (!result.success) {
      return res.status(400).json({ error: "\xC9rv\xE9nytelen munkat\xE1rs azonos\xEDt\xF3." });
    }
    const [staffMember] = await db.select({ id: staff.id, name: staff.name }).from(staff).where(eq12(staff.id, result.data)).limit(1);
    if (!staffMember) {
      return res.status(404).json({ error: "Munkat\xE1rs nem tal\xE1lhat\xF3." });
    }
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const events = await db.select().from(calendarEvents).where(
      and11(
        eq12(calendarEvents.staffId, result.data),
        gte4(calendarEvents.endDatetime, cutoffDate)
      )
    ).orderBy(calendarEvents.startDatetime);
    const now = formatIcsDate(/* @__PURE__ */ new Date());
    const calName = escapeIcsText2(`Gerecse Ingatlan \u2013 ${staffMember.name}`);
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gerecse Ingatlan//Napt\xE1r//HU",
      `X-WR-CALNAME:${calName}`,
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];
    for (const event of events) {
      const typeLabel = EVENT_TYPE_LABELS[event.eventType] ?? event.eventType;
      const description = [
        typeLabel,
        event.description ? event.description : "",
        event.location ? `Helysz\xEDn: ${event.location}` : ""
      ].filter(Boolean).join("\\n");
      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${event.id}@gerecseingatlan.hu`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatIcsDate(event.startDatetime)}`,
        `DTEND:${formatIcsDate(event.endDatetime)}`,
        `SUMMARY:${escapeIcsText2(event.title)}`,
        `DESCRIPTION:${escapeIcsText2(description)}`
      );
      if (event.location) {
        icsLines.push(`LOCATION:${escapeIcsText2(event.location)}`);
      }
      icsLines.push("END:VEVENT");
    }
    icsLines.push("END:VCALENDAR");
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gerecse-ingatlan-${staffMember.name.toLowerCase().replace(/\s+/g, "-")}.ics"`
    );
    res.send(icsLines.join("\r\n"));
  } catch (error) {
    console.error("[calendar/ics] Error:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a napt\xE1r l\xE9trehoz\xE1sakor." });
  }
});
var calendar_default2 = router11;

// server/routes/contact.ts
import { Router as Router12 } from "express";
import { z as z12 } from "zod";
import rateLimit2 from "express-rate-limit";

// server/templates/contact_form.ts
function buildContactEmail(params) {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safePhone = escapeHtml(params.phone || "Nem adta meg");
  const safeSubject = escapeHtml(params.subject);
  const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br />");
  const ACCENT = "#C5A55A";
  const rows = [
    { label: "N\xC9V", value: safeName },
    { label: "E-MAIL", value: safeEmail, isLink: true },
    { label: "TELEFON", value: safePhone },
    { label: "T\xC1RGY", value: safeSubject }
  ];
  const timestamp7 = (/* @__PURE__ */ new Date()).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
  const inner = [
    emailHeader({ monogramSize: 28, monogramColor: ACCENT }),
    emailDivider(ACCENT, 3),
    emailTitle("\xDAj megkeres\xE9s \xE9rkezett", 24),
    emailDataSection(rows, ACCENT),
    emailMessageSection("\xDCZENET", safeMessage, ACCENT),
    emailFooterDivider(ACCENT),
    emailFooter({
      timestamp: timestamp7,
      source: "\xC1ltal\xE1nos kapcsolatfelv\xE9teli \u0171rlap",
      accentColor: ACCENT
    })
  ].join("\n");
  return emailWrapper(inner);
}

// server/templates/interior_design.ts
function interiorDesignBadge() {
  return `<!-- BELS\u0150\xC9P\xCDT\xC9SZET badge -->
                <tr>
                  <td align="center" style="padding: 8px 32px 20px 32px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #A0784D; padding: 8px 20px; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #FFFFFF; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">
                          BELS\u0150\xC9P\xCDT\xC9SZET
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
}
function buildInteriorDesignEmail(params) {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safePhone = escapeHtml(params.phone || "Nem adta meg");
  const safeAddress = escapeHtml(params.address || "Nem adta meg");
  const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br />");
  const ACCENT = "#A0784D";
  const rows = [
    { label: "N\xC9V", value: safeName },
    { label: "E-MAIL", value: safeEmail, isLink: true },
    { label: "TELEFONSZ\xC1M", value: safePhone },
    { label: "INGATLAN C\xCDME VAGY HELYSZ\xCDN", value: safeAddress }
  ];
  const timestamp7 = (/* @__PURE__ */ new Date()).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
  const inner = [
    emailHeader({ monogramSize: 36, monogramColor: ACCENT }),
    emailDivider(ACCENT, 2),
    emailTitle("&#127968; Bels\u0151\xE9p\xEDt\xE9szeti aj\xE1nlatk\xE9r\xE9s", 22),
    emailDataSection(rows, ACCENT),
    emailMessageSection("\xDCZENET, ELK\xC9PZEL\xC9SEK", safeMessage, ACCENT),
    interiorDesignBadge(),
    emailFooterDivider(ACCENT),
    emailFooter({
      timestamp: timestamp7,
      source: "\u2B50 Bels\u0151\xE9p\xEDt\xE9szeti aj\xE1nlatk\xE9r\u0151 \u0171rlap",
      accentColor: ACCENT
    })
  ].join("\n");
  return emailWrapper(inner);
}

// server/routes/contact.ts
var router12 = Router12();
var formLimiter = rateLimit2({
  windowMs: 15 * 60 * 1e3,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    const lang = (_req.headers["accept-language"] ?? "").includes("en") ? "en" : "hu";
    const message = lang === "en" ? "Too many submissions, please try again later." : "T\xFAl sok \u0171rlapbek\xFCld\xE9s, k\xE9rj\xFCk pr\xF3b\xE1lja \xFAjra k\xE9s\u0151bb.";
    res.status(429).json({ error: message });
  }
});
var contactFormSchema = z12.object({
  name: z12.string().min(1, "A n\xE9v megad\xE1sa k\xF6telez\u0151.").max(255),
  email: z12.string().email("\xC9rv\xE9nytelen email c\xEDm.").max(320),
  phone: z12.string().max(50).optional(),
  subject: z12.string().min(1, "A t\xE1rgy megad\xE1sa k\xF6telez\u0151.").max(500),
  message: z12.string().min(1, "Az \xFCzenet megad\xE1sa k\xF6telez\u0151.").max(5e3),
  honeypot: z12.string().optional()
});
var interiorDesignSchema = z12.object({
  name: z12.string().min(1, "A n\xE9v megad\xE1sa k\xF6telez\u0151.").max(255),
  email: z12.string().email("\xC9rv\xE9nytelen email c\xEDm.").max(320),
  phone: z12.string().max(50).optional(),
  address: z12.string().max(500).optional(),
  message: z12.string().min(1, "Az \xFCzenet megad\xE1sa k\xF6telez\u0151.").max(5e3),
  honeypot: z12.string().optional()
});
router12.post("/contact", formLimiter, async (req, res) => {
  try {
    const parsed = contactFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok." });
    }
    const { name, email, phone, subject, message, honeypot } = parsed.data;
    if (honeypot) {
      return res.json({ success: true });
    }
    await getTransporter().sendMail({
      from: getMailFrom(),
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `\xDAj kapcsolatfelv\xE9tel \u2013 ${subject}`,
      html: buildContactEmail({ name, email, phone, subject, message })
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Email k\xFCld\xE9si hiba:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a k\xFCld\xE9s sor\xE1n." });
  }
});
router12.post("/interior-design", formLimiter, async (req, res) => {
  try {
    const parsed = interiorDesignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "\xC9rv\xE9nytelen adatok." });
    }
    const { name, email, phone, address, message, honeypot } = parsed.data;
    if (honeypot) {
      return res.json({ success: true });
    }
    await getTransporter().sendMail({
      from: getMailFrom(),
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `\u{1F3E0} Bels\u0151\xE9p\xEDt\xE9szeti aj\xE1nlatk\xE9r\xE9s \u2013 ${name}`,
      html: buildInteriorDesignEmail({ name, email, phone, address, message })
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Email k\xFCld\xE9si hiba:", error);
    res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a k\xFCld\xE9s sor\xE1n." });
  }
});
var contact_default = router12;

// server/routes/properties.ts
import { Router as Router13 } from "express";
import { eq as eq13, asc as asc2 } from "drizzle-orm";
var INGATLAN_XML_URL2 = process.env.INGATLAN_XML_URL;
var router13 = Router13();
router13.get("/", async (_req, res) => {
  if (!INGATLAN_XML_URL2) {
    return res.status(503).json({
      error: "XML feed URL not configured",
      properties: []
    });
  }
  try {
    const [result, featuredRows] = await Promise.all([
      fetchFeed(INGATLAN_XML_URL2),
      db.select().from(featuredProperties).where(eq13(featuredProperties.isFeatured, true)).orderBy(asc2(featuredProperties.featuredOrder))
    ]);
    const featuredMap = new Map(
      featuredRows.map((r) => [r.propertyId, r.featuredOrder ?? 0])
    );
    const properties = result.properties.map((p) => ({
      ...p,
      featured: featuredMap.has(p.id),
      featuredOrder: featuredMap.get(p.id) ?? null
    }));
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json({ ...result, properties });
  } catch (err) {
    console.error("[api/properties] Error:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});
router13.get("/:id", async (req, res) => {
  if (!INGATLAN_XML_URL2) {
    return res.status(503).json({ error: "XML feed URL not configured" });
  }
  try {
    const result = await fetchFeed(INGATLAN_XML_URL2);
    const property = result.properties.find((p) => p.id === req.params.id || p.slug === req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json({ property, office: result.office });
  } catch (err) {
    console.error("[api/properties/:id] Error:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});
var properties_default = router13;
var feedAdminRouter = Router13();
feedAdminRouter.post("/feed-refresh", async (_req, res) => {
  if (!INGATLAN_XML_URL2) {
    return res.status(503).json({ error: "XML feed URL not configured" });
  }
  try {
    const result = await fetchFeed(INGATLAN_XML_URL2, { forceRefresh: true });
    res.json({
      success: true,
      propertyCount: result.propertyCount,
      errors: result.errors,
      fetchedAt: result.fetchedAt
    });
  } catch (err) {
    console.error("[api/admin/feed-refresh] Error:", err);
    res.status(500).json({ error: "Failed to refresh feed" });
  }
});
feedAdminRouter.get("/feed-status", (_req, res) => {
  res.json(getFeedStatus());
});

// server/routes/staff.ts
import { Router as Router14 } from "express";
import { eq as eq14, asc as asc3 } from "drizzle-orm";
var router14 = Router14();
router14.get("/", async (_req, res) => {
  try {
    const members = await db.select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      roleTitle: staff.roleTitle,
      photoUrl: staff.photoUrl,
      bio: staff.bio,
      showEmail: staff.showEmail,
      showPhone: staff.showPhone,
      sortOrder: staff.sortOrder,
      focalPointX: staff.focalPointX,
      focalPointY: staff.focalPointY
    }).from(staff).where(eq14(staff.active, true)).orderBy(asc3(staff.sortOrder), asc3(staff.name));
    const publicMembers = members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.showEmail !== false ? m.email : null,
      phone: m.showPhone !== false ? m.phone : null,
      roleTitle: m.roleTitle,
      photoUrl: m.photoUrl,
      bio: m.bio,
      focalPointX: m.focalPointX ?? 50,
      focalPointY: m.focalPointY ?? 25
    }));
    res.json({ staff: publicMembers });
  } catch (error) {
    console.error("[staff] Public endpoint error:", error);
    try {
      const members = await db.select({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        roleTitle: staff.roleTitle,
        photoUrl: staff.photoUrl,
        bio: staff.bio
      }).from(staff).where(eq14(staff.active, true)).orderBy(asc3(staff.name));
      const publicMembers = members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        roleTitle: m.roleTitle,
        photoUrl: m.photoUrl,
        bio: m.bio,
        focalPointX: 50,
        focalPointY: 25
      }));
      res.json({ staff: publicMembers });
    } catch {
      res.status(500).json({ error: "Hiba t\xF6rt\xE9nt a munkat\xE1rsak bet\xF6lt\xE9sekor." });
    }
  }
});
var staff_default2 = router14;

// server/index.ts
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import fs2 from "fs";
dotenv2.config({ path: ".env.local" });
var __dirname3 = path3.dirname(fileURLToPath3(import.meta.url));
var isProduction = process.env.NODE_ENV === "production";
var PORT = process.env.PORT || 8080;
var app = express();
app.disable("x-powered-by");
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });
}
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://maps.googleapis.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://www.google-analytics.com",
          "https://analytics.google.com",
          "https://maps.googleapis.com",
          "https://ingatlankozvetitok.ingatlanszoftver.hu"
        ],
        frameSrc: ["https://www.google.com", "https://maps.google.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"]
      }
    } : false,
    // Disable CSP in development — Vite injects inline scripts for HMR
    strictTransportSecurity: {
      maxAge: 31536e3,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false
    // Allow Google Maps embeds
  })
);
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=()"
  );
  next();
});
var generalLimiter = rateLimit3({
  windowMs: 15 * 60 * 1e3,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "T\xFAl sok k\xE9r\xE9s, k\xE9rj\xFCk pr\xF3b\xE1lja \xFAjra k\xE9s\u0151bb." }
});
app.use("/api/", generalLimiter);
app.use((_req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = (name, val, options) => {
    const secureDefaults = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      ...options
    };
    return originalCookie(name, val, secureDefaults);
  };
  next();
});
app.use(express.json({ limit: "10kb" }));
app.use("/uploads", express.static(path3.resolve(__dirname3, "../uploads"), {
  maxAge: "7d",
  immutable: false
}));
var loginLimiter = rateLimit3({
  windowMs: 60 * 1e3,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "T\xFAl sok bejelentkez\xE9si k\xEDs\xE9rlet. Pr\xF3b\xE1lja \xFAjra 1 perc m\xFAlva." }
});
app.use("/api/admin/login", loginLimiter);
app.use("/api/admin", auth_default);
app.use("/api/admin", requireAuth, validateCsrf);
app.use("/api/admin/users", users_default);
app.use("/api/admin/content", content_default);
app.use("/api/admin/newsletter", newsletter_default);
app.use("/api/admin/staff", staff_default);
app.use("/api/admin/calendar", calendar_default);
app.use("/api/admin/dashboard", dashboard_default);
app.use("/api/admin/featured", featured_default);
app.use("/api/admin", feedAdminRouter);
app.use("/api/content", content_default2);
app.use("/api/newsletter", newsletter_default2);
app.use("/api/calendar", calendar_default2);
app.use("/api", contact_default);
app.use("/api/properties", properties_default);
app.use("/api/staff", staff_default2);
app.all("/api/{*splat}", (_req, res) => {
  res.status(404).json({ error: "Az API v\xE9gpont nem tal\xE1lhat\xF3." });
});
app.use("/api", (err, _req, res, _next) => {
  const status = err.status || 500;
  if (isProduction) {
    console.error(JSON.stringify({ level: "error", ts: (/* @__PURE__ */ new Date()).toISOString(), status, msg: err.message }));
  } else {
    console.error("[API Error]", err.message, err.stack);
  }
  res.status(status).json({
    error: isProduction ? "Szerverhiba t\xF6rt\xE9nt." : err.message
  });
});
function escapeHtml2(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
async function injectOgTags(html, propertyId) {
  const ORIGIN = process.env.SITE_URL || "https://gerecseingatlan.hu";
  const feedUrl = process.env.INGATLAN_XML_URL;
  if (!feedUrl) {
    console.warn("[OG] INGATLAN_XML_URL not set, skipping OG injection");
    return html;
  }
  try {
    const feed = await fetchFeed(feedUrl);
    const property = feed.properties.find((p) => p.id === propertyId);
    if (!property) {
      console.warn(`[OG] Property ${propertyId} not found in feed (${feed.propertyCount} properties)`);
      return html;
    }
    const ogTitle = escapeHtml2(property.title);
    const ogDesc = escapeHtml2(`${property.title} \u2013 ${property.address.city}. ${property.area > 0 ? `${property.area} m\xB2, ` : ""}${property.priceFormatted}. Gerecse Ingatlan.`);
    const ogUrl = `${ORIGIN}/ingatlan/${property.id}`;
    const ogImage = property.images[0]?.startsWith("http") ? property.images[0] : property.images[0] ? `${ORIGIN}${property.images[0]}` : `${ORIGIN}/og-image.png`;
    console.log(`[OG] Injecting for property ${propertyId}: image=${ogImage}`);
    const ogTags = `<!-- OG_START -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:image" content="${escapeHtml2(ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Gerecse Ingatlan" />
    <meta property="og:locale" content="hu_HU" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    <meta name="twitter:image" content="${escapeHtml2(ogImage)}" />
    <meta name="description" content="${ogDesc}" />
    <!-- OG_END -->`;
    const replaced = html.replace(/<!-- OG_START -->[\s\S]*?<!-- OG_END -->/, ogTags);
    if (replaced === html) {
      console.warn("[OG] OG_START/OG_END markers not found in HTML, appending before </head>");
      return html.replace("</head>", `${ogTags}
  </head>`);
    }
    return replaced;
  } catch (err) {
    console.error(`[OG] Failed for property ${propertyId}:`, err instanceof Error ? err.message : err);
    return html;
  }
}
async function start() {
  let indexHtml;
  if (isProduction) {
    if (!process.env.DATABASE_URL) {
      console.error(JSON.stringify({ level: "fatal", ts: (/* @__PURE__ */ new Date()).toISOString(), msg: "DATABASE_URL is not set \u2014 aborting" }));
      process.exit(1);
    }
    const distPath = path3.resolve(__dirname3, "../dist");
    app.use(express.static(distPath, { index: false }));
    indexHtml = fs2.readFileSync(path3.join(distPath, "index.html"), "utf-8");
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 24679 }
      },
      appType: "custom"
    });
    app.use(vite.middlewares);
    indexHtml = fs2.readFileSync(path3.resolve(__dirname3, "../index.html"), "utf-8");
    app.use((req, res, next) => {
      if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/@") || req.originalUrl.startsWith("/src") || req.originalUrl.startsWith("/node_modules") || req.originalUrl.includes(".")) {
        return next();
      }
      (async () => {
        let html = await vite.transformIndexHtml(req.originalUrl, indexHtml);
        const propertyMatch = req.originalUrl.match(/^(?:\/en)?\/ingatlan\/([^/?]+)/);
        if (propertyMatch) {
          html = await injectOgTags(html, propertyMatch[1]);
        }
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      })().catch(next);
    });
  }
  if (isProduction) {
    app.get("/{*splat}", (req, res) => {
      let html = indexHtml;
      const propertyMatch = req.url.match(/^(?:\/en)?\/ingatlan\/([^/?]+)/);
      if (propertyMatch) {
        injectOgTags(html, propertyMatch[1]).then((injected) => {
          res.status(200).set({ "Content-Type": "text/html" }).end(injected);
        }).catch(() => {
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
        });
      } else {
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      }
    });
  }
  app.listen(PORT, () => {
    if (isProduction) {
      console.log(JSON.stringify({ level: "info", ts: (/* @__PURE__ */ new Date()).toISOString(), msg: `Server listening on port ${PORT}`, mode: "production" }));
    } else {
      console.log(`Server running on http://localhost:${PORT} (development)`);
    }
  });
}
start();
