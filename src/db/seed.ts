import { count, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { hashPassword } from "@/lib/auth/password";
import { DEFAULT_HOMEPAGE_CONFIG, DEFAULT_PRODUCTS } from "@/lib/mock-data";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface SeedOptions {
  adminEmail?: string;
  adminPassword?: string;
}

/**
 * Idempotent: fills an empty catalog, creates the homepage row if missing,
 * and creates or updates the admin user when credentials are provided.
 * Existing products and homepage edits are never overwritten.
 */
export async function seedDatabase(db: Db, options: SeedOptions = {}): Promise<string[]> {
  const log: string[] = [];

  const [{ value: productCount }] = await db.select({ value: count() }).from(schema.products);
  if (productCount === 0) {
    await db.insert(schema.products).values(
      DEFAULT_PRODUCTS.map((product, index) => ({
        id: product.id,
        name: product.name,
        priceCents: Math.round(product.price * 100),
        category: product.category,
        color: product.color,
        sizes: product.size,
        images: product.images,
        badge: product.badge ?? null,
        similarIds: product.similarIds,
        position: index,
      }))
    );
    log.push(`Seeded ${DEFAULT_PRODUCTS.length} products`);
  } else {
    log.push(`Catalog already present (${productCount} products), not re-seeded`);
  }

  const existingConfig = await db
    .select({ id: schema.homepageConfig.id })
    .from(schema.homepageConfig)
    .where(eq(schema.homepageConfig.id, 1));
  if (existingConfig.length === 0) {
    await db.insert(schema.homepageConfig).values({ id: 1, ...DEFAULT_HOMEPAGE_CONFIG });
    log.push("Seeded homepage config");
  }

  const adminEmail = options.adminEmail?.trim().toLowerCase();
  if (adminEmail && options.adminPassword) {
    const passwordHash = await hashPassword(options.adminPassword);
    await db
      .insert(schema.users)
      .values({ email: adminEmail, passwordHash, role: "admin" })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { passwordHash, role: "admin" },
      });
    log.push(`Admin account ready: ${adminEmail}`);
  }

  return log;
}
