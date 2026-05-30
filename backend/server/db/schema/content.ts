import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pagePath: varchar("page_path", { length: 255 }).notNull(),
    blockKey: varchar("block_key", { length: 255 }).notNull(),
    content: text("content").notNull().default(""),
    contentType: varchar("content_type", { length: 20 })
      .notNull()
      .default("text"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("content_blocks_page_block_idx").on(
      table.pagePath,
      table.blockKey
    ),
  ]
);

export const contentBlockVersions = pgTable("content_block_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockId: uuid("block_id")
    .notNull()
    .references(() => contentBlocks.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 20 }).notNull(),
  version: integer("version").notNull(),
  editedBy: uuid("edited_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type NewContentBlock = typeof contentBlocks.$inferInsert;
export type ContentBlockVersion = typeof contentBlockVersions.$inferSelect;
