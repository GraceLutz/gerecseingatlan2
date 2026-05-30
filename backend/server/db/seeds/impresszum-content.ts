/**
 * Seed script: migrates hardcoded Impresszum page content into the CMS.
 * Run: npx tsx server/db/seeds/impresszum-content.ts
 *
 * Safe to re-run — uses ON CONFLICT DO NOTHING so existing edits are preserved.
 */
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function bi(hu: string, en: string): string {
  return JSON.stringify({ hu, en });
}

interface Block {
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: string;
}

const PAGE = "/impresszum";

const blocks: Block[] = [
  // Page hero
  { pagePath: PAGE, blockKey: "page.title", content: bi("Impresszum", "Legal Notice"), contentType: "json" },
  { pagePath: PAGE, blockKey: "page.subtitle", content: bi("Jogszabályi kötelezettség a 2001. évi CVIII. törvény (Ekertv.) alapján", "Legal obligation under Hungarian Act CVIII of 2001"), contentType: "json" },

  // Company information — heading
  { pagePath: PAGE, blockKey: "company.heading", content: bi("Szolgáltató adatai", "Service Provider"), contentType: "json" },
  // Company information — labels (bilingual)
  { pagePath: PAGE, blockKey: "company.nameLabel", content: bi("Cégnév", "Company name"), contentType: "json" },
  { pagePath: PAGE, blockKey: "company.addressLabel", content: bi("Székhely", "Registered office"), contentType: "json" },
  { pagePath: PAGE, blockKey: "company.regLabel", content: bi("Cégjegyzékszám", "Company registration no."), contentType: "json" },
  { pagePath: PAGE, blockKey: "company.taxLabel", content: bi("Adószám", "Tax number"), contentType: "json" },
  { pagePath: PAGE, blockKey: "company.courtLabel", content: bi("Nyilvántartó bíróság", "Court of registration"), contentType: "json" },
  { pagePath: PAGE, blockKey: "company.repLabel", content: bi("Képviselő", "Representative"), contentType: "json" },
  // Company information — values
  { pagePath: PAGE, blockKey: "company.name", content: "Gerecse Ingatlan Kft.", contentType: "text" },
  { pagePath: PAGE, blockKey: "company.address", content: "2890 Tata, Példa utca 1.", contentType: "text" },
  { pagePath: PAGE, blockKey: "company.regNumber", content: "11-09-XXXXXX", contentType: "text" },
  { pagePath: PAGE, blockKey: "company.taxNumber", content: "XXXXXXXX-X-XX", contentType: "text" },
  { pagePath: PAGE, blockKey: "company.court", content: bi("Tatabányai Törvényszék Cégbírósága", "Company Court of Tatabánya"), contentType: "json" },
  { pagePath: PAGE, blockKey: "company.rep", content: bi("Gerecse Ingatlan ügyvezető", "Managing Director"), contentType: "json" },

  // Contact information
  { pagePath: PAGE, blockKey: "contact.heading", content: bi("Elérhetőségek", "Contact Information"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.phone", content: "+36 70 613 2658", contentType: "text" },
  { pagePath: PAGE, blockKey: "contact.email", content: "info@gerecseingatlan.hu", contentType: "text" },
  { pagePath: PAGE, blockKey: "contact.website", content: "gerecseingatlan.hu", contentType: "text" },

  // Hosting provider
  { pagePath: PAGE, blockKey: "hosting.heading", content: bi("Tárhelyszolgáltató", "Hosting Provider"), contentType: "json" },
  { pagePath: PAGE, blockKey: "hosting.nameLabel", content: bi("Név", "Name"), contentType: "json" },
  { pagePath: PAGE, blockKey: "hosting.addressLabel", content: bi("Cím", "Address"), contentType: "json" },
  { pagePath: PAGE, blockKey: "hosting.webLabel", content: bi("Weboldal", "Website"), contentType: "json" },
  { pagePath: PAGE, blockKey: "hosting.name", content: "[Tárhelyszolgáltató neve]", contentType: "text" },
  { pagePath: PAGE, blockKey: "hosting.address", content: "[Tárhelyszolgáltató címe]", contentType: "text" },
  { pagePath: PAGE, blockKey: "hosting.website", content: "[Tárhelyszolgáltató weboldala]", contentType: "text" },

  // Copyright
  { pagePath: PAGE, blockKey: "copyright.heading", content: bi("Szerzői jogok", "Copyright"), contentType: "json" },
  { pagePath: PAGE, blockKey: "copyright.text", content: bi("A weboldalon megjelenő tartalmak (szövegek, képek, grafikák, logók) a Gerecse Ingatlan Kft. szellemi tulajdonát képezik. Ezek másolása, terjesztése vagy bármilyen felhasználása kizárólag a Gerecse Ingatlan Kft. előzetes írásos engedélyével lehetséges.", "All content on this website (texts, images, graphics, logos) is the intellectual property of Gerecse Ingatlan Kft. Copying, distribution or any use of these materials is only permitted with prior written consent of Gerecse Ingatlan Kft."), contentType: "json" },

  // Last updated
  { pagePath: PAGE, blockKey: "page.lastUpdated", content: bi("Utolsó frissítés: 2026. április 16.", "Last updated: 16 April 2026"), contentType: "json" },
];

async function run() {
  console.log(`[impresszum-seed] Migrating ${blocks.length} content blocks...`);

  for (const b of blocks) {
    await pool.query(
      `INSERT INTO content_blocks (page_path, block_key, content, content_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (page_path, block_key) DO NOTHING`,
      [b.pagePath, b.blockKey, b.content, b.contentType]
    );
  }

  const total = await pool.query(
    "SELECT count(*) FROM content_blocks WHERE page_path = $1",
    [PAGE]
  );
  console.log(
    `[impresszum-seed] Done. Impresszum blocks in DB: ${total.rows[0].count}`
  );
  await pool.end();
}

run().catch((e) => {
  console.error("[impresszum-seed] Fatal:", e);
  process.exit(1);
});
