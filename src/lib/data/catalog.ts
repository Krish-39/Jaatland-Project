import "server-only";
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { homepageConfig, products, type ProductRow } from "@/db/schema";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/mock-data";
import type { HomepageConfig, Product, ProductCategory, ProductSize } from "@/lib/types";

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.priceCents / 100,
    category: row.category as ProductCategory,
    color: row.color,
    size: row.sizes as ProductSize[],
    images: row.images,
    badge: row.badge ?? undefined,
    similarIds: row.similarIds,
  };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const db = await getDb();
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.position), asc(products.createdAt));
  return rows.map(toProduct);
});

export const getProduct = cache(async (id: string): Promise<Product | null> => {
  const db = await getDb();
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ? toProduct(rows[0]) : null;
});

export const getHomepageConfig = cache(async (): Promise<HomepageConfig> => {
  const db = await getDb();
  const rows = await db.select().from(homepageConfig).where(eq(homepageConfig.id, 1)).limit(1);
  const row = rows[0];
  if (!row) return DEFAULT_HOMEPAGE_CONFIG;

  return {
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    heroImage: row.heroImage,
    newsletterTitle: row.newsletterTitle,
    newsletterSubtitle: row.newsletterSubtitle,
    homepageProducts: {
      ...DEFAULT_HOMEPAGE_CONFIG.homepageProducts,
      ...row.homepageProducts,
    },
  };
});
