import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_CONFIG, DEFAULT_PRODUCTS } from "@/lib/mock-data";
import * as schema from "./schema";

const drizzleDir = path.join(process.cwd(), "drizzle");

describe("migration 0002: databases seeded before the product rename", () => {
  it("repoints old image paths and renames untouched seed products", async () => {
    const client = new PGlite();
    const db = drizzle(client, { schema });

    // Bring the database to the state an older build left behind: schema up
    // to 0001, catalog seeded with the old names and file names.
    await migrate(db, { migrationsFolder: drizzleDir });
    await db.delete(schema.products);
    await db.insert(schema.products).values([
      { id: "p1", name: "Classic Tee", priceCents: 2499, category: "Unisex", color: "White", sizes: ["M"], images: ["/products/classic-tee-1.jpg", "/products/classic-tee-2.jpg"], badge: "Bestseller", similarIds: [] },
      { id: "p4", name: "My Own Hoodie Name", priceCents: 4999, category: "Unisex", color: "Gray", sizes: ["L"], images: ["/products/desi-flex-hoodie-1.jpg"], badge: "Limited", similarIds: [] },
      { id: "p6", name: "Nakhre Tote", priceCents: 1899, category: "Accessories", color: "Beige", sizes: ["One"], images: ["/products/nakhre-tote-1.jpg"], badge: null, similarIds: [] },
    ]);
    await db.insert(schema.homepageConfig).values({
      id: 1,
      ...DEFAULT_HOMEPAGE_CONFIG,
      heroTitle: "Jaatland — Land of Premium Wear.",
      newsletterTitle: "Join the Jaatland club",
    }).onConflictDoUpdate({
      target: schema.homepageConfig.id,
      set: { heroTitle: "Jaatland — Land of Premium Wear.", newsletterTitle: "Join the Jaatland club" },
    });

    // Re-run 0002 against that data.
    const sql = readFileSync(path.join(drizzleDir, "0002_update_seed_names.sql"), "utf8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      await client.exec(statement);
    }

    const rows = await db.select().from(schema.products);
    const byId = Object.fromEntries(rows.map((row) => [row.id, row]));

    expect(byId.p1.name).toBe("Essential Crew-Neck T-Shirt");
    expect(byId.p1.badge).toBe("Core Range");
    expect(byId.p1.images).toEqual(["/products/crew-neck-t-shirt-1.jpg", "/products/crew-neck-t-shirt-2.jpg"]);
    // An admin's own name is kept; the image path is still fixed.
    expect(byId.p4.name).toBe("My Own Hoodie Name");
    expect(byId.p4.images).toEqual(["/products/pullover-hoodie-1.jpg"]);
    expect(byId.p6.name).toBe("Everyday Tote Bag");

    const [config] = await db.select().from(schema.homepageConfig).where(eq(schema.homepageConfig.id, 1));
    expect(config.heroTitle).toBe(DEFAULT_HOMEPAGE_CONFIG.heroTitle);
    expect(config.newsletterTitle).toBe(DEFAULT_HOMEPAGE_CONFIG.newsletterTitle);
  });

  it("every image the seed catalog references exists in public/", () => {
    const paths = [...DEFAULT_PRODUCTS.flatMap((product) => product.images), DEFAULT_HOMEPAGE_CONFIG.heroImage];
    for (const src of paths) {
      expect(existsSync(path.join(process.cwd(), "public", src)), src).toBe(true);
    }
  });
});
