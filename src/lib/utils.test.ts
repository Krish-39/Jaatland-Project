import { describe, expect, it } from "vitest";
import { formatCurrency, getImageUrl } from "./utils";

describe("formatCurrency", () => {
  it("uses a stable euro format regardless of the machine locale", () => {
    expect(formatCurrency(24.99)).toBe("€24.99");
    expect(formatCurrency(1234.5)).toBe("€1,234.50");
  });
});

describe("getImageUrl", () => {
  it("returns the first non-empty image", () => {
    expect(getImageUrl({ images: ["", "https://example.com/a.jpg"] })).toBe(
      "https://example.com/a.jpg"
    );
  });

  it("returns an empty string when there are no images", () => {
    expect(getImageUrl({ images: [] })).toBe("");
    expect(getImageUrl({})).toBe("");
  });
});
