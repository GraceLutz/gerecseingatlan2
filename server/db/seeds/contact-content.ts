/**
 * Seed script: migrates hardcoded ContactPage content into the CMS.
 * Run: npx tsx server/db/seeds/contact-content.ts
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

const PAGE = "/kapcsolat";

const blocks: Block[] = [
  // Page hero
  { pagePath: PAGE, blockKey: "page.title", content: bi("Kapcsolat", "Contact"), contentType: "json" },
  { pagePath: PAGE, blockKey: "page.subtitle", content: bi("Vegye fel velünk a kapcsolatot", "Get in touch with us"), contentType: "json" },

  // Contact info cards
  { pagePath: PAGE, blockKey: "contact.info.phone.label", content: bi("Telefon", "Phone"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.info.phone.value", content: "+36 70 613 2658", contentType: "text" },
  { pagePath: PAGE, blockKey: "contact.info.email.label", content: bi("E-mail", "Email"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.info.email.value", content: "info@gerecseingatlan.hu", contentType: "text" },
  { pagePath: PAGE, blockKey: "contact.info.hours.label", content: bi("Nyitvatartás", "Opening Hours"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.info.hours.weekdays", content: bi("Hétfő - Péntek: 9:00 - 17:00", "Monday - Friday: 9:00 AM - 5:00 PM"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.info.hours.saturday", content: bi("Szombat: 10:00 - 13:00", "Saturday: 10:00 AM - 1:00 PM"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.info.hours.sunday", content: bi("Vasárnap: Zárva", "Sunday: Closed"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.info.facebook.label", content: bi("Facebook oldalunk", "Visit us on Facebook"), contentType: "json" },

  // Form section
  { pagePath: PAGE, blockKey: "contact.form.title", content: bi("Vegye fel velünk a kapcsolatot", "Get in touch with us"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.name.label", content: bi("Név", "Name"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.email.label", content: bi("E-mail", "Email"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.phone.label", content: bi("Telefon", "Phone"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.subject.label", content: bi("Tárgy", "Subject"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.message.label", content: bi("Üzenet", "Message"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.gdpr", content: bi("Elfogadom az adatkezelési tájékoztatót és hozzájárulok személyes adataim kezeléséhez. *", "I accept the privacy policy and consent to the processing of my personal data. *"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.submit", content: bi("Küldés", "Send"), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.submitting", content: bi("Küldés...", "Sending..."), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.success", content: bi("Üzenetét sikeresen elküldtük! Hamarosan felvesszük Önnel a kapcsolatot.", "Your message has been sent successfully! We will contact you shortly."), contentType: "json" },
  { pagePath: PAGE, blockKey: "contact.form.errorPrefix", content: bi("Hiba történt az üzenet küldésekor: ", "Error sending message: "), contentType: "json" },
];

async function seed() {
  const client = await pool.connect();
  try {
    let inserted = 0;
    for (const block of blocks) {
      const result = await client.query(
        `INSERT INTO content_blocks (page_path, block_key, content, content_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (page_path, block_key) DO NOTHING`,
        [block.pagePath, block.blockKey, block.content, block.contentType]
      );
      if (result.rowCount && result.rowCount > 0) inserted++;
    }
    console.log(`Contact page seed complete: ${inserted} new blocks inserted (${blocks.length - inserted} already existed).`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
