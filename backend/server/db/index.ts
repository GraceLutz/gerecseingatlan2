import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// .env.local betöltése — biztonsági háló arra az esetre ha tsx --env-file nem lép hatályba időben
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as users from "./schema/users.js";
import * as content from "./schema/content.js";
import * as newsletter from "./schema/newsletter.js";
import * as staff from "./schema/staff.js";
import * as calendar from "./schema/calendar.js";
import * as featured from "./schema/featured.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check .env.local");
}

console.log("[db] Connecting with:", process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, {
  schema: { ...users, ...content, ...newsletter, ...staff, ...calendar, ...featured },
});

export { pool };