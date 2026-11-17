import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/db";
import { orders, users } from "@/db/schema";
import { getProducts } from "@/lib/data/catalog";
import type { Product } from "@/lib/types";
import {
  createOrderRecord,
  deleteOrdersForUser,
  getGuestOrders,
  getOrdersForUser,
  getOrderStats,
  UnavailableItemsError,
} from "./orders";

const shipping = { name: "Test Buyer", address: "Teststr. 1", city: "Berlin", zip: "10115" };

describe("orders (against an in-memory database)", () => {
  let catalog: Product[];
  let userId: string;

  beforeAll(async () => {
    catalog = await getProducts();
    const db = await getDb();
    const [user] = await db
      .insert(users)
      .values({ email: "buyer@example.com", passwordHash: "x" })
      .returning({ id: users.id });
    userId = user.id;
  });

  it("prices a guest order from the catalog and adds shipping", async () => {
    const { id, accessToken } = await createOrderRecord({
      userId: null,
      email: "guest@example.com",
      cart: [{ id: "p1", size: "M", qty: 1 }],
      catalog,
      shipping,
    });

    expect(id).toMatch(/^JL-[0-9A-F]{10}$/);
    expect(accessToken).toBeTruthy();

    const [order] = await getGuestOrders([{ id, token: accessToken! }]);
    expect(order.subtotal).toBe(24.99);
    expect(order.shippingCost).toBe(4.9);
    expect(order.total).toBe(29.89);
    expect(order.items[0]).toMatchObject({ id: "p1", name: "Classic Tee", price: 24.99, qty: 1 });
  });

  it("never stores the guest token itself and rejects a wrong token", async () => {
    const { id, accessToken } = await createOrderRecord({
      userId: null,
      email: "guest@example.com",
      cart: [{ id: "p4", size: "L", qty: 1 }],
      catalog,
      shipping,
    });

    const db = await getDb();
    const [row] = await db.select().from(orders).where(eq(orders.id, id));
    expect(row.accessTokenHash).not.toBe(accessToken);

    expect(await getGuestOrders([{ id, token: "wrong-token-wrong-token-wrong" }])).toEqual([]);
    expect(await getGuestOrders([{ id, token: accessToken! }])).toHaveLength(1);
  });

  it("links a signed-in order to the account and hides it from token lookups", async () => {
    const { id, accessToken } = await createOrderRecord({
      userId,
      email: "buyer@example.com",
      cart: [{ id: "p4", size: "L", qty: 1 }],
      catalog,
      shipping,
    });

    expect(accessToken).toBeNull();
    expect((await getOrdersForUser(userId)).map((order) => order.id)).toEqual([id]);
    expect(await getGuestOrders([{ id, token: "anything-anything-anything" }])).toEqual([]);
  });

  it("refuses unknown products and sizes the product is not sold in", async () => {
    await expect(
      createOrderRecord({
        userId: null,
        email: "g@example.com",
        cart: [{ id: "does-not-exist", size: "M", qty: 1 }],
        catalog,
        shipping,
      })
    ).rejects.toBeInstanceOf(UnavailableItemsError);

    await expect(
      createOrderRecord({
        userId: null,
        email: "g@example.com",
        cart: [{ id: "p3", size: "XXL", qty: 1 }],
        catalog,
        shipping,
      })
    ).rejects.toBeInstanceOf(UnavailableItemsError);
  });

  it("reports totals for the admin dashboard", async () => {
    const stats = await getOrderStats();
    expect(stats.orderCount).toBe(3);
    expect(stats.revenue).toBeCloseTo(29.89 + 49.99 + 49.99, 2);
    expect(stats.customerCount).toBe(1);
    expect(stats.recentOrders).toHaveLength(3);
  });

  it("deletes orders older than the retention period when a new order is placed", async () => {
    const db = await getDb();
    await db.insert(orders).values({
      id: "JL-OLD",
      email: "old@example.com",
      items: [],
      subtotalCents: 0,
      shippingCents: 0,
      totalCents: 0,
      shippingName: "x",
      shippingAddress: "x",
      shippingCity: "x",
      shippingZip: "00000",
      shippingCountry: "Germany",
      createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    });

    await createOrderRecord({
      userId: null,
      email: "g@example.com",
      cart: [{ id: "p6", size: "One", qty: 1 }],
      catalog,
      shipping,
    });

    expect(await db.select().from(orders).where(eq(orders.id, "JL-OLD"))).toHaveLength(0);
  });

  it("erases an account's orders on request", async () => {
    await deleteOrdersForUser(userId);
    expect(await getOrdersForUser(userId)).toEqual([]);
  });
});
