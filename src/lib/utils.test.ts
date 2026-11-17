import { describe, expect, it } from "vitest";
import { formatCurrency, getImageUrl, isAllowedImageSrc } from "./utils";

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

describe("isAllowedImageSrc", () => {
  it("accepts local files and the allowlisted host", () => {
    expect(isAllowedImageSrc("/products/crew-neck-t-shirt-1.jpg")).toBe(true);
    expect(isAllowedImageSrc("https://images.unsplash.com/photo-1")).toBe(true);
  });

  it("rejects other hosts, plain http, protocol-relative and junk values", () => {
    expect(isAllowedImageSrc("https://example.com/a.jpg")).toBe(false);
    expect(isAllowedImageSrc("http://images.unsplash.com/photo-1")).toBe(false);
    expect(isAllowedImageSrc("//evil.example/a.jpg")).toBe(false);
    expect(isAllowedImageSrc("not a url")).toBe(false);
    expect(isAllowedImageSrc("")).toBe(false);
    expect(isAllowedImageSrc(null)).toBe(false);
  });
});
