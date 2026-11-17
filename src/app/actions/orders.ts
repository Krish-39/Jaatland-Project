"use server";

import { headers } from "next/headers";
import { isShowcaseMode, SHOWCASE_MESSAGE } from "@/db/url";
import { getCurrentUser } from "@/lib/auth/session";
import { getProducts } from "@/lib/data/catalog";
import {
  createOrderRecord,
  getGuestOrders,
  getOrdersForUser,
  UnavailableItemsError,
} from "@/lib/data/orders";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import type { Order } from "@/lib/types";
import { firstIssue, guestOrderRefsSchema, placeOrderSchema } from "@/lib/validation";

export type PlaceOrderResult =
  | { ok: true; orderId: string; accessToken: string | null }
  | { ok: false; error: string };

const orderLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function placeOrderAction(input: unknown): Promise<PlaceOrderResult> {
  if (isShowcaseMode()) return { ok: false, error: SHOWCASE_MESSAGE };

  if (!orderLimiter.check(clientKey(await headers()))) {
    return { ok: false, error: "Too many orders in a short time. Please wait a minute." };
  }

  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const data = parsed.data;

  const [user, catalog] = await Promise.all([getCurrentUser(), getProducts()]);

  try {
    const { id, accessToken } = await createOrderRecord({
      userId: user?.id ?? null,
      email: data.email,
      cart: data.items,
      catalog,
      shipping: { name: data.name, address: data.address, city: data.city, zip: data.zip },
    });
    return { ok: true, orderId: id, accessToken };
  } catch (error) {
    if (error instanceof UnavailableItemsError) {
      return {
        ok: false,
        error:
          "Some items in your cart are no longer available. Please update your cart and try again.",
      };
    }
    throw error;
  }
}

/** Orders the caller may see: their account's orders when signed in, plus
 * any guest orders they hold a valid token for. */
export async function getMyOrdersAction(guestRefs: unknown): Promise<Order[]> {
  if (isShowcaseMode()) return [];

  const refs = guestOrderRefsSchema.safeParse(guestRefs);
  const user = await getCurrentUser();

  const [accountOrders, guestOrders] = await Promise.all([
    user ? getOrdersForUser(user.id) : Promise.resolve([]),
    refs.success ? getGuestOrders(refs.data) : Promise.resolve([]),
  ]);

  return [...accountOrders, ...guestOrders].sort((a, b) => b.date.localeCompare(a.date));
}
