import type Stripe from "stripe";
import type { Order } from "@/lib/types";

/** Stripe's minimum lifetime for a Checkout Session. */
const SESSION_LIFETIME_SECONDS = 30 * 60;

const toCents = (euros: number) => Math.round(euros * 100);

/**
 * Builds the Stripe Checkout Session for an order that already exists in the
 * database. Every amount comes from the stored order, never from the browser.
 */
export function buildCheckoutSessionParams(
  order: Order,
  origin: string,
  now: number = Date.now()
): Stripe.Checkout.SessionCreateParams {
  const shippingCents = toCents(order.shippingCost ?? 0);

  return {
    mode: "payment",
    locale: "en",
    customer_email: order.email,
    client_reference_id: order.id,
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
    expires_at: Math.floor(now / 1000) + SESSION_LIFETIME_SECONDS,
    line_items: order.items.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: "eur",
        unit_amount: toCents(item.price ?? 0),
        product_data: {
          name: item.name ?? "Product",
          ...(item.size && item.size !== "One" ? { description: `Size ${item.size}` } : {}),
        },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: shippingCents === 0 ? "Free shipping (Germany)" : "Standard shipping (Germany)",
          fixed_amount: { amount: shippingCents, currency: "eur" },
        },
      },
    ],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?payment=cancelled`,
  };
}
