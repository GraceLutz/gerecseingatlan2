/**
 * Seed script: migrates ServicesOverview, AboutPreview, Footer, and NewsletterSection
 * hardcoded text into the content_blocks table for inline editing.
 *
 * Run: npx tsx server/db/seeds/homepage-extra-content.ts
 *
 * Safe to re-run — uses ON CONFLICT DO NOTHING so existing edits are preserved.
 * Bilingual content stored as JSON: {"hu": "...", "en": "..."}
 */
import { db } from "../index.js";
import { contentBlocks } from "../schema/content.js";

interface SeedBlock {
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: "text" | "json" | "html" | "markdown";
}

function bilingual(hu: string, en: string): string {
  return JSON.stringify({ hu, en });
}

const seeds: SeedBlock[] = [
  // ── ServicesOverview (/) ──────────────────────────────────────
  { pagePath: "/", blockKey: "services.subtitle", content: bilingual("Átfogó ingatlanszolgáltatások az Ön igényeire szabva", "Comprehensive real estate services tailored to your needs"), contentType: "json" },
  { pagePath: "/", blockKey: "services.more", content: bilingual("Tovább", "Learn more"), contentType: "json" },
  { pagePath: "/", blockKey: "services.salesTitle", content: bilingual("Ingatlan értékesítés és bérbeadás", "Property Sales & Rentals"), contentType: "json" },
  { pagePath: "/", blockKey: "services.salesDesc", content: bilingual("Lakossági, gazdasági és ipari ingatlanok értékesítése és bérbeadása.", "Residential, commercial, and industrial property sales and rentals."), contentType: "json" },
  { pagePath: "/", blockKey: "services.appraisalTitle", content: bilingual("Értékbecslés és értékmeghatározás készítése", "Appraisal & Value Determination"), contentType: "json" },
  { pagePath: "/", blockKey: "services.appraisalDesc", content: bilingual("Hivatalos értékbecslés és piaci értékmeghatározás szakértői közreműködéssel.", "Official property appraisal and market value determination with expert involvement."), contentType: "json" },
  { pagePath: "/", blockKey: "services.legalTitle", content: bilingual("Teljeskörű jogi háttér", "Full Legal Support"), contentType: "json" },
  { pagePath: "/", blockKey: "services.legalDesc", content: bilingual("Ügyvédi közreműködés, szerződésírás, jogi tanácsadás ingatlanügyekhez.", "Legal assistance, contract drafting, and advisory for property transactions."), contentType: "json" },
  { pagePath: "/", blockKey: "services.loanTitle", content: bilingual("Hitel- és állami támogatások ügyintézése", "Loan & State Subsidy Administration"), contentType: "json" },
  { pagePath: "/", blockKey: "services.loanDesc", content: bilingual("Segítségnyújtás banki hitelek és állami támogatások ügyintézésében.", "Assistance with bank loans and government subsidy applications."), contentType: "json" },
  { pagePath: "/", blockKey: "services.energyTitle", content: bilingual("Energetikai tanúsítvány", "Energy Performance Certificate"), contentType: "json" },
  { pagePath: "/", blockKey: "services.energyDesc", content: bilingual("Energetikai tanúsítvány készítése ingatlan adásvételhez és bérbeadáshoz akkreditált szakértőkkel.", "Energy performance certificates for property sales and rentals, issued by accredited specialists."), contentType: "json" },
  { pagePath: "/", blockKey: "services.interiorTitle", content: bilingual("Belsőépítészet, látványtervezés", "Interior Design & Visualization"), contentType: "json" },
  { pagePath: "/", blockKey: "services.interiorDesc", content: bilingual("Belsőépítészeti tanácsadás és 3D látványtervezés közvetítése.", "Interior design consulting and 3D visualization brokering."), contentType: "json" },

  // ── AboutPreview (/) ─────────────────────────────────────────
  { pagePath: "/", blockKey: "about.counter.years", content: bilingual("Év tapasztalat", "Years of experience"), contentType: "json" },
  { pagePath: "/", blockKey: "about.counter.sold", content: bilingual("Eladott ingatlan", "Properties sold"), contentType: "json" },
  { pagePath: "/", blockKey: "about.counter.clients", content: bilingual("Elégedett ügyfél", "Satisfied clients"), contentType: "json" },
  { pagePath: "/", blockKey: "about.cta.label", content: bilingual("Tovább a teljes bemutatáshoz", "Read our full story"), contentType: "json" },

  // ── NewsletterSection (/) ────────────────────────────────────
  { pagePath: "/", blockKey: "newsletter.title", content: bilingual("Iratkozzon fel hírlevelünkre", "Subscribe to our newsletter"), contentType: "json" },
  { pagePath: "/", blockKey: "newsletter.subtitle", content: bilingual("Értesüljön elsőként az új ingatlanokról és akciókról!", "Be the first to hear about new properties and offers!"), contentType: "json" },
  { pagePath: "/", blockKey: "newsletter.success", content: bilingual("Sikeres feliratkozás!", "Successfully subscribed!"), contentType: "json" },
  { pagePath: "/", blockKey: "newsletter.placeholder", content: bilingual("E-mail cím", "Email address"), contentType: "json" },
  { pagePath: "/", blockKey: "newsletter.button", content: bilingual("Feliratkozás", "Subscribe"), contentType: "json" },
  { pagePath: "/", blockKey: "newsletter.emailInvalid", content: bilingual("Kérjük, adjon meg érvényes e-mail címet.", "Please enter a valid email address."), contentType: "json" },
  { pagePath: "/", blockKey: "newsletter.gdpr", content: bilingual("Elfogadom az adatkezelési tájékoztatót", "I accept the privacy policy"), contentType: "json" },
  { pagePath: "/", blockKey: "newsletter.gdprInvalid", content: bilingual("A feliratkozáshoz el kell fogadnia az adatkezelést.", "You must accept the privacy policy to subscribe."), contentType: "json" },

  // ── Footer (/footer) ────────────────────────────────────────
  { pagePath: "/footer", blockKey: "contact.title", content: bilingual("Kapcsolat", "Contact"), contentType: "json" },
  { pagePath: "/footer", blockKey: "quickLinks.title", content: bilingual("Gyors linkek", "Quick Links"), contentType: "json" },
  { pagePath: "/footer", blockKey: "services.title", content: bilingual("Szolgáltatások", "Services"), contentType: "json" },
  { pagePath: "/footer", blockKey: "newsletter.title", content: bilingual("Hírlevél", "Newsletter"), contentType: "json" },
  { pagePath: "/footer", blockKey: "newsletter.subtitle", content: bilingual("Értesüljön elsőként az új ingatlanokról és akciókról!", "Be the first to hear about new properties and offers!"), contentType: "json" },
  { pagePath: "/footer", blockKey: "copyright", content: bilingual("© 2026 Gerecse Ingatlan. Minden jog fenntartva.", "© 2026 Gerecse Ingatlan. All rights reserved."), contentType: "json" },
  { pagePath: "/footer", blockKey: "imprint", content: bilingual("Impresszum", "Imprint"), contentType: "json" },
  { pagePath: "/footer", blockKey: "privacy", content: bilingual("Adatvédelem", "Privacy Policy"), contentType: "json" },
  { pagePath: "/footer", blockKey: "cookies", content: bilingual("Sütik kezelése", "Cookie Settings"), contentType: "json" },
  { pagePath: "/footer", blockKey: "terms", content: bilingual("ÁSZF", "Terms"), contentType: "json" },
];

async function seed() {
  console.log(`[seed] Inserting ${seeds.length} content blocks (ServicesOverview + AboutPreview + Newsletter + Footer)...`);

  for (const block of seeds) {
    await db
      .insert(contentBlocks)
      .values({
        pagePath: block.pagePath,
        blockKey: block.blockKey,
        content: block.content,
        contentType: block.contentType,
      })
      .onConflictDoNothing();
  }

  console.log("[seed] Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
