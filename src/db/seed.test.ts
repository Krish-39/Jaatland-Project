import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import { verifyPassword } from "@/lib/auth/password";
import { DEFAULT_PRODUCTS } from "@/lib/mock-data";
import * as schema from "./schema";
import { seedDatabase, type Db } from "./seed";

// Runs the real migrations against an in-memory Postgres, so a migration
// that does not match the schema fails here rather than on deploy.
describe("migrations and seed", () => {
  let db: Db;

  beforeAll(async () => {
    const local = drizzle(new PGlite(), { schema });
    await migrate(local, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    db = local as unknown as Db;
  });

  it("seeds the catalog and homepage once", async () => {
    await seedDatabase(db);
    await seedDatabase(db);

    const products = await db.select().from(schema.products);
    expect(products).toHaveLength(DEFAULT_PRODUCTS.length);
    expect(products.find((product) => product.id === "p1")?.priceCents).toBe(2499);
    expect(await db.select().from(schema.homepageConfig)).toHaveLength(1);
  });

  it("does not overwrite catalog edits when run again", async () => {
    await db.update(schema.products).set({ name: "Edited" }).where(eq(schema.products.id, "p1"));
    await seedDatabase(db);

    const [row] = await db.select().from(schema.products).where(eq(schema.products.id, "p1"));
    expect(row.name).toBe("Edited");
  });

  it("creates the admin with a hashed password and updates it on change", async () => {
    await seedDatabase(db, { adminEmail: " Admin@Example.com ", adminPassword: "first-password" });
    await seedDatabase(db, { adminEmail: "admin@example.com", adminPassword: "second-password" });

    const admins = await db.select().from(schema.users);
    expect(admins).toHaveLength(1);
    expect(admins[0].email).toBe("admin@example.com");
    expect(admins[0].role).toBe("admin");
    expect(admins[0].passwordHash).not.toContain("second-password");
    expect(await verifyPassword("second-password", admins[0].passwordHash)).toBe(true);
    expect(await verifyPassword("first-password", admins[0].passwordHash)).toBe(false);
  });

  it("deletes a user's sessions with the user", async () => {
    const [user] = await db.select().from(schema.users);
    await db.insert(schema.sessions).values({
      id: "hash",
      userId: user.id,
      expiresAt: new Date(Date.now() + 60_000),
    });
    await db.delete(schema.users).where(eq(schema.users.id, user.id));

    expect(await db.select().from(schema.sessions)).toHaveLength(0);
  });
});
