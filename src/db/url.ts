// Vercel's Postgres integrations expose the connection string under different
// names depending on how the database was added. Accept the common ones.
const URL_VARIABLES = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"] as const;

export function databaseUrl(): string | undefined {
  for (const name of URL_VARIABLES) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

export const MISSING_DATABASE_MESSAGE = [
  "No database is connected to this Vercel project.",
  "",
  "Fix: in Vercel open the project > Storage > Create Database > Neon (Postgres),",
  "connect it to this project for the Production and Preview environments,",
  "then redeploy. That sets DATABASE_URL automatically.",
  "Also set ADMIN_EMAIL and ADMIN_PASSWORD under Settings > Environment Variables.",
].join("\n");
