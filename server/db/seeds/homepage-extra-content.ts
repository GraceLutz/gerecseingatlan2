/**
 * Seed script: migrates Footer and ServicesOverview subtitle text
 * into the content_blocks table for inline editing.
 *
 * Run: npx tsx server/db/seeds/homepage-extra-content.ts
 *
 * Safe to re-run — uses ON CONFLICT DO NOTHING so existing edits are preserved.
 */
import { db } from "../index.js";
import { contentBlocks } from "../schema/content.js";
import { sql } from "drizzle-orm";

interface SeedBlock {
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: "text" | "html" | "markdown";
}

const seeds: SeedBlock[] = [
  // ── Services Overview subtitle (/) ──────────────────────────
  { pagePath: "/", blockKey: "services.overview.subtitle", content: "Átfogó ingatlanszolgáltatások az Ön igényeire szabva", contentType: "text" },

  // ── Footer (/footer) ──────────────────────────────────────
  { pagePath: "/footer", blockKey: "contact.title", content: "Kapcsolat", contentType: "text" },
  { pagePath: "/footer", blockKey: "quickLinks.title", content: "Gyors linkek", contentType: "text" },
  { pagePath: "/footer", blockKey: "services.title", content: "Szolgáltatások", contentType: "text" },
  { pagePath: "/footer", blockKey: "newsletter.title", content: "Hírlevél", contentType: "text" },
  { pagePath: "/footer", blockKey: "newsletter.subtitle", content: "Értesüljön elsőként az új ingatlanokról és akciókról!", contentType: "text" },
  { pagePath: "/footer", blockKey: "copyright", content: "© 2026 Gerecse Ingatlan. Minden jog fenntartva.", contentType: "text" },
  { pagePath: "/footer", blockKey: "imprint", content: "Impresszum", contentType: "text" },
  { pagePath: "/footer", blockKey: "privacy", content: "Adatvédelem", contentType: "text" },
  { pagePath: "/footer", blockKey: "cookies", content: "Sütik kezelése", contentType: "text" },
  { pagePath: "/footer", blockKey: "terms", content: "ÁSZF", contentType: "text" },

  // ── Footer EN (/footer) ───────────────────────────────────
  // Note: EN content will be served via the CMS language toggle or separate page paths.
  // The following are placeholders for reference if multi-lang CMS is added:
  // { pagePath: "/en/footer", blockKey: "contact.title", content: "Contact", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "quickLinks.title", content: "Quick Links", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "services.title", content: "Services", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "newsletter.title", content: "Newsletter", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "newsletter.subtitle", content: "Be the first to know about new properties and offers!", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "copyright", content: "© 2026 Gerecse Ingatlan. All rights reserved.", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "imprint", content: "Imprint", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "privacy", content: "Privacy Policy", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "cookies", content: "Cookie Settings", contentType: "text" },
  // { pagePath: "/en/footer", blockKey: "terms", content: "Terms", contentType: "text" },
];

async function seed() {
  console.log(`[seed] Inserting ${seeds.length} content blocks (Footer + ServicesOverview)...`);

  for (const block of seeds) {
    await db
      .insert(contentBlocks)
      .values({
        pagePath: block.pagePath,
        blockKey: block.blockKey,
        content: block.content,
        contentType: block.contentType,
        version: 1,
      })
      .onConflictDoNothing();
  }

  console.log("[seed] Done.");
  await sql`SELECT 1`.execute(db);
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
