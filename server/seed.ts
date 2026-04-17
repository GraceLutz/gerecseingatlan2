import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import bcrypt from "bcryptjs";
import { db, pool } from "./db/index.js";
import { users } from "./db/schema/users.js";
import { eq } from "drizzle-orm";

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
    process.exit(1);
  }

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    console.log(`Admin user ${email} already exists, skipping seed.`);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    name: "Adminisztrátor",
    role: "admin",
    active: true,
  });

  console.log(`Admin user ${email} created successfully.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
