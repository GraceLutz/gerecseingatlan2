import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const subscriberStatusEnum = pgEnum("subscriber_status", [
  "pending",
  "confirmed",
  "unsubscribed",
]);

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 255 }),
    status: subscriberStatusEnum("status").notNull().default("pending"),
    confirmationToken: uuid("confirmation_token").defaultRandom(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("newsletter_subscribers_email_idx").on(table.email)]
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "sent",
]);

export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  subject: varchar("subject", { length: 500 }).notNull(),
  preheader: varchar("preheader", { length: 255 }),
  body: text("body").notNull(),
  status: campaignStatusEnum("campaign_status").notNull().default("draft"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  sentBy: uuid("sent_by"),
  recipientCount: integer("recipient_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect;
export type NewNewsletterCampaign = typeof newsletterCampaigns.$inferInsert;
