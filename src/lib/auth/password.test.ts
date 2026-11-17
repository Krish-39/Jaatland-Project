import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("correct horse batterx", hash)).toBe(false);
  });

  it("salts every hash", async () => {
    const [a, b] = await Promise.all([hashPassword("same"), hashPassword("same")]);
    expect(a).not.toBe(b);
  });

  it("never stores the password itself", async () => {
    expect(await hashPassword("hunter2-hunter2")).not.toContain("hunter2");
  });

  it("returns false for malformed or foreign hashes", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "plain-text-password")).toBe(false);
    expect(await verifyPassword("x", "scrypt$99$8$1$abc$def")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$15$8$1$abc$def")).toBe(false);
  });
});
