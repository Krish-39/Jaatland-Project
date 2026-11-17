import { describe, expect, it } from "vitest";
import { adminEnvReport, describeAdminEnv } from "./admin-env";

describe("adminEnvReport", () => {
  it("is fine when both variables are set", () => {
    const report = adminEnvReport({ ADMIN_EMAIL: "a@b.de", ADMIN_PASSWORD: "secret-value" });
    expect(report).toEqual({ emailSet: true, passwordSet: true, lookalikes: [] });
    expect(describeAdminEnv(report, "preview").join("\n")).not.toContain("WARNING");
  });

  it("reports a missing variable and how to fix it", () => {
    const lines = describeAdminEnv(adminEnvReport({ ADMIN_EMAIL: "a@b.de" }), "preview");
    expect(lines).toContain("ADMIN_PASSWORD: missing");
    expect(lines.join("\n")).toContain('tick the "preview" environment');
  });

  it("treats a blank email as missing", () => {
    expect(adminEnvReport({ ADMIN_EMAIL: "  ", ADMIN_PASSWORD: "x" }).emailSet).toBe(false);
  });

  it("finds mistyped names and never prints values", () => {
    const report = adminEnvReport({
      "ADMIN_EMAIL.": "a@b.de",
      admin_password: "super-secret-value",
      ADMIN_EMAILS_LIST: "unrelated",
    });
    expect(report.lookalikes).toEqual(["ADMIN_EMAIL.", "admin_password"]);

    const output = describeAdminEnv(report, "preview").join("\n");
    expect(output).toContain('"ADMIN_EMAIL."');
    expect(output).not.toContain("super-secret-value");
    expect(output).not.toContain("a@b.de");
  });
});
