import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as users from "./schema/users.js";
import * as content from "./schema/content.js";
import * as newsletter from "./schema/newsletter.js";
import * as staff from "./schema/staff.js";
import * as calendar from "./schema/calendar.js";
import * as featured from "./schema/featured.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, {
  schema: { ...users, ...content, ...newsletter, ...staff, ...calendar, ...featured },
});

export { pool };
