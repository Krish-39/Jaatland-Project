import { afterEach, describe, expect, it, vi } from "vitest";

// Showcase mode must never open a database connection.
vi.mock("@/db", () => ({
  getDb: () => {
    throw new Error("getDb must not be called in showcase mode");
  },
}));

import { DEFAULT_HOMEPAGE_CONFIG, DEFAULT_PRODUCTS } from "@/lib/mock-data";
import { getHomepageConfig, getProduct, getProducts } from "./catalog";

describe("catalog in showcase mode", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("serves the built-in catalog without a database", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("DATABASE_URL", "");

    expect(await getProducts()).toEqual(DEFAULT_PRODUCTS);
    expect((await getProduct("p1"))?.name).toBe(DEFAULT_PRODUCTS[0].name);
    expect(await getProduct("missing")).toBeNull();
    expect(await getHomepageConfig()).toEqual(DEFAULT_HOMEPAGE_CONFIG);
  });
});
