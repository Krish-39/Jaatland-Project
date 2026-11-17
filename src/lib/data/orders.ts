import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, count, desc, eq, inArray, isNull, lt, sum } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, users, type OrderRow } from "@/db/schema";
import { calculateItemsTotal, toOrderItems, type CartLine } from "@/lib/orders";
import { orderTotalFor, shippingCostFor } from "@/lib/shipping";
import type { Order, Product } from "@/lib/types";

/** Demo orders are personal data with no fulfilment purpose, so they are
 * kept only this long. A live shop would instead follow statutory retention
 * periods for invoices. */
export const DEMO_ORDER_RETENTION_DAYS = 30;

const toCents = (euros: number) => Math.round(euros * 100);

export function hashOrderToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    date: row.createdAt.toISOString(),
    email: row.email,
    items: row.items,
    subtotal: row.subtotalCents / 100,
    shippingCost: row.shippingCents / 100,
    total: row.totalCents / 100,
    status: row.status,
    shipping: {
      name: row.shippingName,
      email: row.email,
      address: row.shippingAddress,
      city: row.shippingCity,
      zip: row.shippingZip,
      country: row.shippingCountry,
    },
  };
}

export class UnavailableItemsError extends Error {
  constructor() {
    super("Some items in your cart are no longer available.");
    this.name = "UnavailableItemsError";
  }
}

export interface NewOrder {
  userId: string | null;
  email: string;
  cart: CartLine[];
  /** The current catalog, read from the database by the caller. */
  catalog: Product[];
  shipping: { name: string; address: string; city: string; zip: string };
}

/**
 * Creates an order priced entirely from the server-side catalog. Nothing the
 * browser says about names, prices or totals is used.
 * Guests get back a one-time token that lets them view the order later.
 */
export async function createOrderRecord(
  input: NewOrder
): Promise<{ id: string; accessToken: string | null }> {
  // Every line must be a real product in a size that product is sold in.
  const valid = input.cart.every((line) => {
    const product = input.catalog.find((candidate) => candidate.id === line.id);
    if (!product) return false;
    return line.size === undefined
      ? product.size.length === 0
      : (product.size as string[]).includes(line.size);
  });
  if (!valid) throw new UnavailableItemsError();

  const items = toOrderItems(input.cart, input.catalog);
  const subtotal = calculateItemsTotal(items);
  const accessToken = input.userId ? null : randomBytes(24).toString("base64url");
  const id = `JL-${randomBytes(5).toString("hex").toUpperCase()}`;

  const db = await getDb();
  await db.insert(orders).values({
    id,
    userId: input.userId,
    accessTokenHash: accessToken ? hashOrderToken(accessToken) : null,
    email: input.email,
    items,
    subtotalCents: toCents(subtotal),
    shippingCents: toCents(shippingCostFor(subtotal)),
    totalCents: toCents(orderTotalFor(subtotal)),
    shippingName: input.shipping.name,
    shippingAddress: input.shipping.address,
    shippingCity: input.shipping.city,
    shippingZip: input.shipping.zip,
    shippingCountry: "Germany",
  });

  // Opportunistic retention cleanup.
  const cutoff = new Date(Date.now() - DEMO_ORDER_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(orders).where(lt(orders.createdAt, cutoff));

  return { id, accessToken };
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  return rows.map(toOrder);
}

/** Returns only the guest orders whose secret token matches. Knowing an
 * order id alone is never enough. */
export async function getGuestOrders(refs: { id: string; token: string }[]): Promise<Order[]> {
  if (refs.length === 0) return [];

  const db = await getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(and(inArray(orders.id, refs.map((ref) => ref.id)), isNull(orders.userId)))
    .orderBy(desc(orders.createdAt));

  return rows
    .filter((row) => {
      const ref = refs.find((candidate) => candidate.id === row.id);
      return !!ref && !!row.accessTokenHash && row.accessTokenHash === hashOrderToken(ref.token);
    })
    .map(toOrder);
}

export async function deleteOrdersForUser(userId: string): Promise<void> {
  const db = await getDb();
  await db.delete(orders).where(eq(orders.userId, userId));
}

export interface AdminStats {
  productCount: number;
  customerCount: number;
  orderCount: number;
  revenue: number;
  recentOrders: Pick<Order, "id" | "date" | "total" | "status" | "email">[];
}

export async function getOrderStats(): Promise<Omit<AdminStats, "productCount">> {
  const db = await getDb();
  const [[totals], [customers], recent] = await Promise.all([
    db.select({ orderCount: count(), revenueCents: sum(orders.totalCents) }).from(orders),
    db.select({ value: count() }).from(users).where(eq(users.role, "customer")),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(20),
  ]);

  return {
    customerCount: customers.value,
    orderCount: totals.orderCount,
    revenue: Number(totals.revenueCents ?? 0) / 100,
    recentOrders: recent.map((row) => {
      const order = toOrder(row);
      return {
        id: order.id,
        date: order.date,
        total: order.total,
        status: order.status,
        email: order.email,
      };
    }),
  };
}
