// Applies pending migrations, then seeds. Safe to run on every deploy.
// Usage: DATABASE_URL=... npm run db:migrate
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "node:path";
import * as schema from "../src/db/schema";
import { seedDatabase, type Db } from "../src/db/seed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[db] DATABASE_URL is not set; skipping migrations (embedded database is used).");
    return;
  }

  const db = drizzle(neon(url), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log("[db] Migrations applied");

  const log = await seedDatabase(db as unknown as Db, {
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
  });
  for (const line of log) console.log(`[db] ${line}`);
}

main().catch((error) => {
  console.error("[db] Migration failed:", error);
  process.exit(1);
});
