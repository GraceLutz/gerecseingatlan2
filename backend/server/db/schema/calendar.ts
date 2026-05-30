import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { staff } from "./staff";

export const eventTypeEnum = pgEnum("event_type", [
  "ingatlan_megtekintes",
  "ugyfel_talalkozo",
  "belso_megbeszeles",
  "szabadsag",
  "egyeb",
]);

export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDatetime: timestamp("start_datetime", { withTimezone: true }).notNull(),
  endDatetime: timestamp("end_datetime", { withTimezone: true }).notNull(),
  staffId: uuid("staff_id").references(() => staff.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "set null" }),
  eventType: eventTypeEnum("event_type").notNull().default("egyeb"),
  location: varchar("location", { length: 500 }),
  propertyId: text("property_id"),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("calendar_events_staff_id_idx").on(table.staffId),
  index("calendar_events_start_datetime_idx").on(table.startDatetime),
]);

export const eventInvitees = pgTable("event_invitees", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => calendarEvents.id, { onDelete: "cascade" }),
  staffId: uuid("staff_id")
    .references(() => staff.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull(),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index("event_invitees_event_id_idx").on(table.eventId),
  index("event_invitees_staff_id_idx").on(table.staffId),
]);

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
export type EventInvitee = typeof eventInvitees.$inferSelect;
export type NewEventInvitee = typeof eventInvitees.$inferInsert;
