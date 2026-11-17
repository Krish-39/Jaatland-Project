"use server";

import { headers } from "next/headers";
import { isShowcaseMode, SHOWCASE_MESSAGE } from "@/db/url";
import { getCurrentUser } from "@/lib/auth/session";
import { getProducts } from "@/lib/data/catalog";
import { SITE_URL } from "@/lib/legal-config";
import { buildCheckoutSessionParams } from "@/lib/payments/checkout-session";
import { getStripe } from "@/lib/payments/stripe";
import {
  attachStripeSession,
  createOrderRecord,
  getOrderRow,
  toOrder,
  getGuestOrders,
  getOrdersForUser,
  UnavailableItemsError,
} from "@/lib/data/orders";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import type { Order } from "@/lib/types";
import { firstIssue, guestOrderRefsSchema, placeOrderSchema } from "@/lib/validation";

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      accessToken: string | null;
      /** Stripe Checkout page to send the buyer to; null when payments are off. */
      paymentUrl: string | null;
    }
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

  let created: { id: string; accessToken: string | null };
  try {
    created = await createOrderRecord({
      userId: user?.id ?? null,
      email: data.email,
      cart: data.items,
      catalog,
      shipping: { name: data.name, address: data.address, city: data.city, zip: data.zip },
    });
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

  const stripe = getStripe();
  if (!stripe) {
    // Payments are not configured: the order stays a demo order.
    return { ok: true, orderId: created.id, accessToken: created.accessToken, paymentUrl: null };
  }

  // Price the payment from the stored order, not from the request.
  const row = await getOrderRow(created.id);
  if (!row) throw new Error(`Order ${created.id} vanished after creation`);

  try {
    const session = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams(toOrder(row), await requestOrigin()),
      { idempotencyKey: `checkout-${created.id}` }
    );
    if (!session.url) throw new Error("Stripe returned no Checkout URL");

    await attachStripeSession(created.id, session.id);
    return {
      ok: true,
      orderId: created.id,
      accessToken: created.accessToken,
      paymentUrl: session.url,
    };
  } catch (error) {
    // Details stay in the server log; the buyer gets a plain message.
    console.error("[payments] Could not create Checkout Session:", error);
    return {
      ok: false,
      error: "The payment page could not be opened. Your card has not been charged. Please try again.",
    };
  }
}

/** Origin of the page that submitted the form. Next.js rejects server
 * actions whose Origin does not match the host, so this is the site itself. */
async function requestOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin && /^https?:\/\/[^/]+$/.test(origin)) return origin;

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return host ? `${protocol}://${host}` : SITE_URL;
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
