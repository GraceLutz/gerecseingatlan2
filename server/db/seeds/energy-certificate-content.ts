/**
 * Seed script: populates bilingual content for the /energetikai-tanusitvany
 * (Energy Performance Certificate) service page.
 *
 * Run: npx tsx server/db/seeds/energy-certificate-content.ts
 *
 * Safe to re-run — uses ON CONFLICT DO UPDATE so content stays current.
 */
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

interface Block {
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: string;
}

function bi(hu: string, en: string): string {
  return JSON.stringify({ hu, en });
}

const PAGE_PATH = "/energetikai-tanusitvany";

const blocks: Block[] = [
  {
    pagePath: PAGE_PATH,
    blockKey: "service.title",
    content: bi("Energetikai tanúsítvány", "Energy Performance Certificate"),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.subtitle",
    content: bi(
      "Energetikai tanúsítvány készítése akkreditált szakértőkkel",
      "Energy performance certificates by accredited specialists"
    ),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.paragraphs",
    content: JSON.stringify({
      hu: [
        "Energetikai tanúsítvány készítése ingatlan adásvételhez, bérbeadáshoz és pályázatokhoz.",
        "A tanúsítvány az épület energiahatékonyságát minősíti, és jogszabály által előírt dokumentum az ingatlan értékesítésénél.",
        "Tapasztalt, akkreditált szakértőinkkel gyors és megbízható ügyintézést biztosítunk.",
        "Vegye fel velünk a kapcsolatot részletekért és árajánlatért!",
      ],
      en: [
        "Energy performance certificate for property sales, rentals, and grant applications.",
        "The certificate rates the energy efficiency of the building and is a legally required document when selling a property.",
        "With our experienced, accredited specialists we provide fast and reliable service.",
        "Contact us for details and a quote!",
      ],
    }),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.benefits",
    content: JSON.stringify({
      hu: [
        "Akkreditált szakértők",
        "Gyors ügyintézés",
        "Jogszabálynak megfelelő tanúsítvány",
        "Adásvételhez és bérbeadáshoz egyaránt",
      ],
      en: [
        "Accredited specialists",
        "Fast processing",
        "Legally compliant certificate",
        "For both sales and rentals",
      ],
    }),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.benefits.title",
    content: bi("Előnyeink", "Our Benefits"),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.cta.text",
    content: bi("Érdekli szolgáltatásunk? Kérjen tanúsítványt!", "Interested in our service? Request a certificate!"),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.cta.label",
    content: bi("Tanúsítványt kérek", "Request certificate"),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.cta.url",
    content: bi("/kapcsolat", "/en/contact"),
    contentType: "json",
  },
  {
    pagePath: PAGE_PATH,
    blockKey: "service.otherServices",
    content: bi("További szolgáltatásaink", "Our Other Services"),
    contentType: "json",
  },
];

async function run() {
  console.log(
    `[energy-certificate-seed] Seeding ${blocks.length} content blocks for ${PAGE_PATH}...`
  );

  for (const b of blocks) {
    await pool.query(
      `INSERT INTO content_blocks (page_path, block_key, content, content_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (page_path, block_key) DO UPDATE SET content = $3, content_type = $4, updated_at = NOW()`,
      [b.pagePath, b.blockKey, b.content, b.contentType]
    );
  }

  console.log(`[energy-certificate-seed] Done. ${blocks.length} blocks upserted.`);
  await pool.end();
}

run().catch((e) => {
  console.error("[energy-certificate-seed] Fatal error:", e);
  process.exit(1);
});
