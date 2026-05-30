import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  doublePrecision,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const chatMessageRoleEnum = pgEnum("chat_message_role", [
  "user",
  "assistant",
  "tool",
]);

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userSessionId: varchar("user_session_id", { length: 255 }).notNull(),
  propertyId: text("property_id"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  messageCount: integer("message_count").notNull().default(0),
}, (table) => [
  index("chat_sessions_user_session_id_idx").on(table.userSessionId),
  index("chat_sessions_property_id_idx").on(table.propertyId),
]);

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: chatMessageRoleEnum("role").notNull(),
  content: text("content"),
  toolCalls: jsonb("tool_calls"),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("chat_messages_session_id_idx").on(table.sessionId),
]);

export const placesCache = pgTable("places_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  queryHash: varchar("query_hash", { length: 128 }).notNull(),
  result: jsonb("result").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  hitCount: integer("hit_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("places_cache_query_hash_idx").on(table.queryHash),
]);

export const distanceCache = pgTable("distance_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  originLat: doublePrecision("origin_lat").notNull(),
  originLng: doublePrecision("origin_lng").notNull(),
  destPlaceId: varchar("dest_place_id", { length: 255 }).notNull(),
  mode: varchar("mode", { length: 20 }).notNull(),
  distanceM: integer("distance_m").notNull(),
  durationS: integer("duration_s").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("distance_cache_origin_dest_mode_idx").on(
    table.originLat,
    table.originLng,
    table.destPlaceId,
    table.mode,
  ),
]);

export const apiUsageLog = pgTable("api_usage_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  service: varchar("service", { length: 50 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  tokensOrUnits: integer("tokens_or_units"),
  estimatedCostEur: numeric("estimated_cost_eur", { precision: 10, scale: 6 }).notNull(),
  userSessionId: varchar("user_session_id", { length: 255 }),
  propertyId: text("property_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("api_usage_log_service_idx").on(table.service),
  index("api_usage_log_created_at_idx").on(table.createdAt),
  index("api_usage_log_user_session_id_idx").on(table.userSessionId),
]);

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type PlacesCache = typeof placesCache.$inferSelect;
export type NewPlacesCache = typeof placesCache.$inferInsert;
export type DistanceCache = typeof distanceCache.$inferSelect;
export type NewDistanceCache = typeof distanceCache.$inferInsert;
export type ApiUsageLog = typeof apiUsageLog.$inferSelect;
export type NewApiUsageLog = typeof apiUsageLog.$inferInsert;

export const leadStatusEnum = pgEnum("lead_status", ["uj", "felhivva", "nem_elerheto", "lezart"]);

export const aiLeads = pgTable("ai_leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }),
  propertyId: text("property_id"),
  sessionId: uuid("session_id").references(() => chatSessions.id, { onDelete: "set null" }),
  conversationSummary: text("conversation_summary"),
  currentPath: varchar("current_path", { length: 500 }),
  ipHash: varchar("ip_hash", { length: 64 }),
  status: leadStatusEnum("status").notNull().default("uj"),
  calledAt: timestamp("called_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("ai_leads_status_idx").on(table.status),
  index("ai_leads_created_at_idx").on(table.createdAt),
]);

export type AiLead = typeof aiLeads.$inferSelect;
export type NewAiLead = typeof aiLeads.$inferInsert;
