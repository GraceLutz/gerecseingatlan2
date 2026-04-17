/**
 * Seed script: migrates hardcoded Hungarian text from the public site
 * into the content_blocks table for inline editing.
 *
 * Run: npx tsx server/db/seeds/content-seed.ts
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
  // ── Homepage (/) ──────────────────────────────────────────
  { pagePath: "/", blockKey: "hero.title", content: "Gerecse Ingatlan", contentType: "text" },
  { pagePath: "/", blockKey: "hero.subtitle", content: "Professzionális ingatlanszolgáltatások a Gerecse régióban", contentType: "text" },
  { pagePath: "/", blockKey: "hero.cta", content: "Ingatlanok böngészése", contentType: "text" },
  { pagePath: "/", blockKey: "search.title", content: "Ingatlan keresése", contentType: "text" },
  { pagePath: "/", blockKey: "featured.title", content: "Kiemelt ingatlanok", contentType: "text" },
  { pagePath: "/", blockKey: "featured.viewAll", content: "Az összes ingatlan", contentType: "text" },
  { pagePath: "/", blockKey: "services.title", content: "Szolgáltatásaink", contentType: "text" },
  { pagePath: "/", blockKey: "services.subtitle", content: "Átfogó ingatlanszolgáltatások az Ön igényeire szabva", contentType: "text" },
  { pagePath: "/", blockKey: "about.title", content: "Rólunk", contentType: "text" },
  { pagePath: "/", blockKey: "about.subtitle", content: "Megbízható partner az ingatlanpiacon", contentType: "text" },
  { pagePath: "/", blockKey: "about.desc", content: "A Gerecse Ingatlan elkötelezett csapata több éves tapasztalattal segíti ügyfeleit az ingatlanpiacon. Legyen szó vásárlásról, eladásról vagy bérbeadásról, professzionális szolgáltatásainkkal biztosítjuk a sikeres ügyleteket.", contentType: "text" },
  { pagePath: "/", blockKey: "about.more", content: "Tovább a teljes bemutatáshoz", contentType: "text" },
  { pagePath: "/", blockKey: "newsletter.title", content: "Iratkozzon fel hírlevelünkre", contentType: "text" },
  { pagePath: "/", blockKey: "newsletter.subtitle", content: "Értesüljön elsőként az új ingatlanokról és akciókról!", contentType: "text" },

  // ── About page (/bemutatkozas) ────────────────────────────
  { pagePath: "/bemutatkozas", blockKey: "about.title", content: "Rólunk", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "about.subtitle", content: "Megbízható partner az ingatlanpiacon", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "about.history", content: "Cégünk története", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "about.historyText", content: "A Gerecse Ingatlan a Gerecse hegység lábánál, a régió ingatlanpiacának egyik meghatározó szereplőjeként működik. Csapatunk helyi szakértelemmel és országos hálózattal rendelkezik, amellyel minden ügyfél számára a legjobb megoldást kínáljuk.", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "about.mission", content: "Küldetésünk", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "about.missionText", content: "Célunk, hogy minden ügyfelünk számára megtaláljuk az ideális ingatlant, vagy a lehető legjobb feltételekkel értékesítsük meglévő ingatlanát. Személyre szabott szolgáltatásainkkal és átlátható ügyintézésünkkel biztosítjuk a stresszmentes ingatlanügyleteket.", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "about.values", content: "Értékeink", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "about.valuesText", content: "Megbízhatóság, szakértelem, személyes odafigyelés és átláthatóság – ezek azok az értékek, amelyek mentén dolgozunk. Minden ügyfelünket egyedi figyelemmel kezeljük.", contentType: "text" },

  // ── Services overview ─────────────────────────────────────
  { pagePath: "/", blockKey: "services.salesTitle", content: "Ingatlan értékesítés és bérbeadás", contentType: "text" },
  { pagePath: "/", blockKey: "services.salesDesc", content: "Lakossági, gazdasági és ipari ingatlanok értékesítése és bérbeadása.", contentType: "text" },
  { pagePath: "/", blockKey: "services.appraisalTitle", content: "Értékbecslés és értékmeghatározás készítése", contentType: "text" },
  { pagePath: "/", blockKey: "services.appraisalDesc", content: "Hivatalos értékbecslés és piaci értékmeghatározás szakértői közreműködéssel.", contentType: "text" },
  { pagePath: "/", blockKey: "services.legalTitle", content: "Teljeskörű jogi háttér", contentType: "text" },
  { pagePath: "/", blockKey: "services.legalDesc", content: "Ügyvédi közreműködés, szerződésírás, jogi tanácsadás ingatlanügyekhez.", contentType: "text" },
  { pagePath: "/", blockKey: "services.loanTitle", content: "Hitel- és állami támogatások ügyintézése", contentType: "text" },
  { pagePath: "/", blockKey: "services.loanDesc", content: "Segítségnyújtás banki hitelek és állami támogatások ügyintézésében.", contentType: "text" },
  { pagePath: "/", blockKey: "services.energyTitle", content: "Energetikai tanúsítvány", contentType: "text" },
  { pagePath: "/", blockKey: "services.energyDesc", content: "Energetikai tanúsítvány készítése ingatlan adásvételhez és bérbeadáshoz akkreditált szakértőkkel.", contentType: "text" },
  { pagePath: "/", blockKey: "services.interiorTitle", content: "Belsőépítészet, látványtervezés", contentType: "text" },
  { pagePath: "/", blockKey: "services.interiorDesc", content: "Belsőépítészeti tanácsadás és 3D látványtervezés közvetítése.", contentType: "text" },

  // ── Contact page (/kapcsolat) ─────────────────────────────
  { pagePath: "/kapcsolat", blockKey: "contact.title", content: "Kapcsolat", contentType: "text" },
  { pagePath: "/kapcsolat", blockKey: "contact.subtitle", content: "Vegye fel velünk a kapcsolatot", contentType: "text" },

  // ── Properties page (/ingatlanok) ─────────────────────────
  { pagePath: "/ingatlanok", blockKey: "properties.title", content: "Ingatlanok", contentType: "text" },
  { pagePath: "/ingatlanok", blockKey: "properties.subtitle", content: "Böngésszen kínálatunkban", contentType: "text" },

  // ── FAQ page (/gyik) ──────────────────────────────────────
  { pagePath: "/gyik", blockKey: "faq.title", content: "Gyakori Kérdések", contentType: "text" },
  { pagePath: "/gyik", blockKey: "faq.subtitle", content: "Válaszok a leggyakrabban felmerülő kérdésekre az ingatlanügyletekkel kapcsolatban.", contentType: "text" },

  // ── Footer (shared across pages, keyed to /) ──────────────
  { pagePath: "/", blockKey: "footer.quickLinks", content: "Gyors linkek", contentType: "text" },
  { pagePath: "/", blockKey: "footer.services", content: "Szolgáltatások", contentType: "text" },
  { pagePath: "/", blockKey: "footer.newsletter", content: "Hírlevél", contentType: "text" },
  { pagePath: "/", blockKey: "footer.copyright", content: "© 2026 Gerecse Ingatlan. Minden jog fenntartva.", contentType: "text" },

  // ── Navigation (shared, keyed to /) ───────────────────────
  { pagePath: "/", blockKey: "nav.home", content: "Kezdőlap", contentType: "text" },
  { pagePath: "/", blockKey: "nav.about", content: "Rólunk", contentType: "text" },
  { pagePath: "/", blockKey: "nav.properties", content: "Ingatlanok", contentType: "text" },
  { pagePath: "/", blockKey: "nav.services", content: "Szolgáltatások", contentType: "text" },
  { pagePath: "/", blockKey: "nav.contact", content: "Kapcsolat", contentType: "text" },
  { pagePath: "/", blockKey: "nav.faq", content: "GYIK", contentType: "text" },

  // ── SEO meta (per page) ───────────────────────────────────
  { pagePath: "/", blockKey: "seo.title", content: "Gerecse Ingatlan – Professzionális ingatlanszolgáltatások", contentType: "text" },
  { pagePath: "/", blockKey: "seo.description", content: "Professzionális ingatlanszolgáltatások a Gerecse régióban. Családi házak, lakások, telkek értékesítése és bérbeadása.", contentType: "text" },
  { pagePath: "/ingatlanok", blockKey: "seo.title", content: "Ingatlanok – Gerecse Ingatlan", contentType: "text" },
  { pagePath: "/ingatlanok", blockKey: "seo.description", content: "Böngésszen kínálatunkban: családi házak, lakások, telkek, nyaralók a Gerecse régióban.", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "seo.title", content: "Rólunk – Gerecse Ingatlan", contentType: "text" },
  { pagePath: "/bemutatkozas", blockKey: "seo.description", content: "Ismerje meg a Gerecse Ingatlan csapatát és szolgáltatásait.", contentType: "text" },
  { pagePath: "/kapcsolat", blockKey: "seo.title", content: "Kapcsolat – Gerecse Ingatlan", contentType: "text" },
  { pagePath: "/kapcsolat", blockKey: "seo.description", content: "Vegye fel velünk a kapcsolatot! Iroda: Tata, telefonszám, e-mail, nyitvatartás.", contentType: "text" },
];

async function seed() {
  console.log(`[content-seed] Seeding ${seeds.length} content blocks...`);

  let inserted = 0;
  let skipped = 0;

  for (const block of seeds) {
    try {
      const result = await db
        .insert(contentBlocks)
        .values({
          pagePath: block.pagePath,
          blockKey: block.blockKey,
          content: block.content,
          contentType: block.contentType,
        })
        .onConflictDoNothing({
          target: [contentBlocks.pagePath, contentBlocks.blockKey],
        });

      if (result.rowCount && result.rowCount > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(
        `[content-seed] Error seeding ${block.pagePath}/${block.blockKey}:`,
        err
      );
    }
  }

  console.log(
    `[content-seed] Done: ${inserted} inserted, ${skipped} already existed.`
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[content-seed] Fatal error:", err);
    process.exit(1);
  });
