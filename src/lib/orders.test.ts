import { describe, expect, it } from "vitest";
import {
  calculateItemsTotal,
  createOrder,
  orderBelongsTo,
  resolveOrderItem,
  toOrderItems,
} from "./orders";
import type { Order, Product } from "./types";

const product: Product = {
  id: "p1",
  name: "Classic Tee",
  price: 24.99,
  category: "Unisex",
  color: "Black",
  size: ["M", "L"],
  images: ["https://example.com/tee.jpg", ""],
  similarIds: [],
};

const shipping = {
  name: "Krish Ahir",
  address: "1 Test Street",
  city: "Berlin",
  zip: "10115",
  country: "Germany",
};

describe("calculateItemsTotal", () => {
  it("multiplies price by quantity", () => {
    expect(calculateItemsTotal([{ price: 24.99, qty: 2 }])).toBe(49.98);
  });

  it("rounds to whole cents", () => {
    expect(calculateItemsTotal([{ price: 0.1, qty: 3 }])).toBe(0.3);
  });

  it("ignores missing prices", () => {
    expect(calculateItemsTotal([{ qty: 3 }])).toBe(0);
  });
});

describe("toOrderItems", () => {
  it("snapshots the name, price and first image", () => {
    expect(
      toOrderItems([{ id: "p1", size: "M", qty: 2 }], [product])
    ).toEqual([
      {
        id: "p1",
        name: "Classic Tee",
        price: 24.99,
        size: "M",
        qty: 2,
        image: "https://example.com/tee.jpg",
      },
    ]);
  });

  it("drops lines whose product no longer exists", () => {
    expect(toOrderItems([{ id: "deleted", qty: 1 }], [product])).toEqual([]);
  });
});

describe("createOrder", () => {
  it("builds a pending order from the cart", () => {
    const order = createOrder({
      cart: [{ id: "p1", size: "M", qty: 2 }],
      products: [product],
      email: "buyer@example.com",
      shipping,
      now: 1_700_000_000_000,
    });

    expect(order).toMatchObject({
      id: "ORD-1700000000000",
      date: new Date(1_700_000_000_000).toISOString(),
      email: "buyer@example.com",
      total: 49.98,
      status: "pending",
      shipping: { ...shipping, email: "buyer@example.com" },
    });
    expect(order.items).toHaveLength(1);
  });
});

describe("orderBelongsTo", () => {
  const order = createOrder({
    cart: [{ id: "p1", qty: 1 }],
    products: [product],
    email: "Buyer@Example.com",
    shipping,
    now: 1_700_000_000_000,
  });

  it("matches the buyer email case-insensitively", () => {
    expect(orderBelongsTo(order, "buyer@example.com")).toBe(true);
  });

  it("matches legacy orders that only stored shipping.email", () => {
    const legacy = {
      ...order,
      email: undefined,
      shipping: { ...order.shipping, email: "legacy@example.com" },
    } as Order;

    expect(orderBelongsTo(legacy, "legacy@example.com")).toBe(true);
  });

  it("rejects other buyers and empty emails", () => {
    expect(orderBelongsTo(order, "someone@example.com")).toBe(false);
    expect(orderBelongsTo(order, "")).toBe(false);
    expect(orderBelongsTo(order, null)).toBe(false);
  });
});

describe("resolveOrderItem", () => {
  it("uses the snapshot even if the catalog price changes", () => {
    const changed = { ...product, name: "Renamed Tee", price: 99 };

    expect(
      resolveOrderItem(
        { id: "p1", name: "Classic Tee", price: 24.99, qty: 1 },
        [changed]
      )
    ).toEqual({
      name: "Classic Tee",
      image: "https://example.com/tee.jpg",
      unitPrice: 24.99,
    });
  });

  it("falls back to the catalog for legacy items without a snapshot", () => {
    expect(resolveOrderItem({ id: "p1", qty: 1 }, [product])).toEqual({
      name: "Classic Tee",
      image: "https://example.com/tee.jpg",
      unitPrice: 24.99,
    });
  });

  it("renders a placeholder when the product is gone", () => {
    expect(resolveOrderItem({ id: "deleted", qty: 1 }, [])).toEqual({
      name: "Product",
      image: "",
      unitPrice: 0,
    });
  });
});
