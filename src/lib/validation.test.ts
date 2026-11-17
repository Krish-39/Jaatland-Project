import { describe, expect, it } from "vitest";
import {
  homepageConfigSchema,
  loginSchema,
  placeOrderSchema,
  productInputSchema,
  registerSchema,
} from "./validation";

const validProduct = {
  name: "  Classic Tee ",
  price: 24.99,
  category: "Unisex",
  color: "White",
  size: ["S", "M"],
  images: ["/products/crew-neck-t-shirt-1.jpg", "  ", ""],
  badge: "",
  similarIds: ["p2"],
};

describe("auth schemas", () => {
  it("normalises the email", () => {
    const parsed = loginSchema.parse({ email: "  Buyer@Example.COM ", password: "x" });
    expect(parsed.email).toBe("buyer@example.com");
  });

  it("rejects invalid emails and short passwords", () => {
    expect(registerSchema.safeParse({ email: "nope", password: "longenough" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.de", password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.de", password: "longenough" }).success).toBe(true);
  });
});

describe("productInputSchema", () => {
  it("trims text, drops empty image rows and empty badges", () => {
    const parsed = productInputSchema.parse(validProduct);
    expect(parsed.name).toBe("Classic Tee");
    expect(parsed.images).toEqual(["/products/crew-neck-t-shirt-1.jpg"]);
    expect(parsed.badge).toBeUndefined();
  });

  it("rejects images from hosts that are not allowlisted", () => {
    const result = productInputSchema.safeParse({
      ...validProduct,
      images: ["https://img01.ztat.net/article/x.jpg"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects bad prices, categories and sizes", () => {
    expect(productInputSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...validProduct, price: -5 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...validProduct, price: "24.99" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...validProduct, category: "Kids" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...validProduct, size: ["XXXL"] }).success).toBe(false);
  });
});

describe("homepageConfigSchema", () => {
  const config = {
    heroTitle: "Title",
    heroSubtitle: "Sub",
    heroImage: "",
    newsletterTitle: "News",
    newsletterSubtitle: "Letter",
    homepageProducts: { Men: [], Women: ["p3"], Unisex: [], Accessories: [] },
  };

  it("accepts an empty hero image and a local one", () => {
    expect(homepageConfigSchema.safeParse(config).success).toBe(true);
    expect(
      homepageConfigSchema.safeParse({ ...config, heroImage: "/products/hero.jpg" }).success
    ).toBe(true);
  });

  it("rejects a hero image from another host", () => {
    expect(
      homepageConfigSchema.safeParse({ ...config, heroImage: "https://example.com/a.jpg" }).success
    ).toBe(false);
  });
});

describe("placeOrderSchema", () => {
  const order = {
    email: "Buyer@Example.com",
    name: "Test Buyer",
    address: "Teststr. 1",
    city: "Berlin",
    zip: "10115",
    items: [{ id: "p1", size: "M", qty: 2 }],
  };

  it("accepts a valid order and normalises the email", () => {
    expect(placeOrderSchema.parse(order).email).toBe("buyer@example.com");
  });

  it("rejects empty carts, bad quantities and non-German postal codes", () => {
    expect(placeOrderSchema.safeParse({ ...order, items: [] }).success).toBe(false);
    expect(
      placeOrderSchema.safeParse({ ...order, items: [{ id: "p1", qty: 0 }] }).success
    ).toBe(false);
    expect(
      placeOrderSchema.safeParse({ ...order, items: [{ id: "p1", qty: 1.5 }] }).success
    ).toBe(false);
    expect(placeOrderSchema.safeParse({ ...order, zip: "1011" }).success).toBe(false);
  });

  it("ignores a price smuggled into a cart line", () => {
    const parsed = placeOrderSchema.parse({
      ...order,
      items: [{ id: "p1", qty: 1, price: 0.01 }],
    });
    expect(parsed.items[0]).toEqual({ id: "p1", qty: 1 });
  });
});
