import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const featuredProperties = pgTable("featured_properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: varchar("property_id", { length: 255 }).notNull().unique(),
  isFeatured: boolean("is_featured").notNull().default(true),
  featuredAt: timestamp("featured_at", { withTimezone: true }).notNull().defaultNow(),
  featuredOrder: integer("featured_order").default(0),
  featuredBy: uuid("featured_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("featured_properties_property_id_idx").on(table.propertyId),
  index("featured_properties_featured_order_idx").on(table.isFeatured, table.featuredOrder),
]);

export type FeaturedProperty = typeof featuredProperties.$inferSelect;
export type NewFeaturedProperty = typeof featuredProperties.$inferInsert;
