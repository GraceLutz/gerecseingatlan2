import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  roleTitle: varchar("role_title", { length: 255 }).notNull().default("Ingatlanközvetítő"),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  active: boolean("active").notNull().default(true),
  showEmail: boolean("show_email").notNull().default(true),
  showPhone: boolean("show_phone").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  focalPointX: integer("focal_point_x").notNull().default(50),
  focalPointY: integer("focal_point_y").notNull().default(25),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("staff_user_id_idx").on(table.userId),
]);

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
