import "server-only";
import path from "node:path";
import { seedDatabase, type Db } from "./seed";
import * as schema from "./schema";
import { databaseUrl, MISSING_DATABASE_MESSAGE } from "./url";

export type { Db };

// One connection per server process. Stored on globalThis so dev-mode hot
// reloads reuse it instead of opening a new database every edit.
const globalForDb = globalThis as unknown as { jaatlandDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  return (globalForDb.jaatlandDb ??= connect());
}

async function connect(): Promise<Db> {
  const url = databaseUrl();

  if (url) {
    const [{ neon }, { drizzle }] = await Promise.all([
      import("@neondatabase/serverless"),
      import("drizzle-orm/neon-http"),
    ]);
    return drizzle(neon(url), { schema }) as unknown as Db;
  }

  if (process.env.VERCEL) {
    throw new Error(MISSING_DATABASE_MESSAGE);
  }

  return connectLocal();
}

/**
 * Local fallback for development, tests and builds without DATABASE_URL: an
 * embedded Postgres (PGlite) that is migrated and seeded on first use. The
 * packages are loaded through variables so the bundler does not ship them in
 * the production server bundle.
 */
async function connectLocal(): Promise<Db> {
  const pglitePackage = "@electric-sql/pglite";
  const drizzlePglitePackage = "drizzle-orm/pglite";
  const migratorPackage = "drizzle-orm/pglite/migrator";

  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pglitePackage),
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ drizzlePglitePackage),
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ migratorPackage),
  ]);

  // `next build` renders pages in several worker processes at once; they must
  // not share one data directory, so each uses a throwaway in-memory database.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const dataDir = isBuild
    ? undefined
    : process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), ".data", "pglite");

  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema }) as unknown as Db;

  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedDatabase(db, {
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
  });

  if (!isBuild) {
    console.warn(
      `[db] DATABASE_URL is not set; using the embedded development database at ${dataDir}.`
    );
  }

  return db;
}
