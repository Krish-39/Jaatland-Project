import { describe, expect, it } from "vitest";
import type { Order } from "@/lib/types";
import { buildCheckoutSessionParams } from "./checkout-session";
import { stripeKeyStatus } from "./stripe-key";

const order: Order = {
  id: "JL-ABC",
  date: "2026-11-17T10:00:00.000Z",
  email: "buyer@example.com",
  items: [
    { id: "p1", name: "Essential Crew-Neck T-Shirt", price: 24.99, size: "M", qty: 2 },
    { id: "p6", name: "Everyday Tote Bag", price: 18.99, size: "One", qty: 1 },
  ],
  subtotal: 68.97,
  shippingCost: 0,
  total: 68.97,
  status: "pending",
  shipping: { name: "T", address: "A", city: "B", zip: "10115", country: "Germany" },
};

describe("buildCheckoutSessionParams", () => {
  const params = buildCheckoutSessionParams(order, "https://shop.example", 1_800_000_000_000);

  it("charges the stored prices in cents and links the order", () => {
    expect(params.line_items).toEqual([
      {
        quantity: 2,
        price_data: {
          currency: "eur",
          unit_amount: 2499,
          product_data: { name: "Essential Crew-Neck T-Shirt", description: "Size M" },
        },
      },
      {
        quantity: 1,
        price_data: { currency: "eur", unit_amount: 1899, product_data: { name: "Everyday Tote Bag" } },
      },
    ]);
    expect(params.metadata).toEqual({ order_id: "JL-ABC" });
    expect(params.customer_email).toBe("buyer@example.com");
  });

  it("adds shipping and returns to this site", () => {
    const withShipping = buildCheckoutSessionParams(
      { ...order, items: [order.items[0]], subtotal: 24.99, shippingCost: 4.9, total: 29.89 },
      "https://shop.example"
    );
    expect(withShipping.shipping_options?.[0].shipping_rate_data?.fixed_amount).toEqual({
      amount: 490,
      currency: "eur",
    });
    expect(params.success_url).toBe(
      "https://shop.example/checkout/success?session_id={CHECKOUT_SESSION_ID}"
    );
    expect(params.cancel_url).toBe("https://shop.example/checkout?payment=cancelled");
    expect(params.expires_at).toBe(1_800_000_000 + 30 * 60);
  });
});

describe("stripeKeyStatus", () => {
  it("accepts only test secret keys", () => {
    expect(stripeKeyStatus("sk_test_123")).toBe("test");
    expect(stripeKeyStatus("rk_test_123")).toBe("test");
    expect(stripeKeyStatus(" sk_test_123 ")).toBe("test");
    expect(stripeKeyStatus("sk_live_123")).toBe("live");
    expect(stripeKeyStatus("pk_test_123")).toBe("publishable");
    expect(stripeKeyStatus("hello")).toBe("invalid");
    expect(stripeKeyStatus(undefined)).toBe("missing");
    expect(stripeKeyStatus("")).toBe("missing");
  });
});
