import { afterEach, describe, expect, it, vi } from "vitest";
import { databaseUrl, isShowcaseMode } from "./url";

describe("database configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  const clear = () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("POSTGRES_URL", "");
    vi.stubEnv("POSTGRES_PRISMA_URL", "");
  };

  it("is in showcase mode on Vercel without a database", () => {
    clear();
    vi.stubEnv("VERCEL", "1");
    expect(isShowcaseMode()).toBe(true);
  });

  it("uses DATABASE_URL or the POSTGRES_URL fallback on Vercel", () => {
    clear();
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("POSTGRES_URL", "postgres://example");
    expect(databaseUrl()).toBe("postgres://example");
    expect(isShowcaseMode()).toBe(false);

    vi.stubEnv("DATABASE_URL", "postgres://primary");
    expect(databaseUrl()).toBe("postgres://primary");
  });

  it("is never in showcase mode outside Vercel (the embedded database is used)", () => {
    clear();
    vi.stubEnv("VERCEL", "");
    expect(isShowcaseMode()).toBe(false);
  });
});
