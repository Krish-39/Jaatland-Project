import "server-only";
import type Stripe from "stripe";
import { markOrderCancelled, markOrderPaid } from "@/lib/data/orders";

export type SessionOutcome = "paid" | "processing" | "cancelled" | "unknown";

/**
 * Applies a Checkout Session's state to its order. Used by both the success
 * page and the webhook, so whichever arrives first records the payment and
 * the other is a no-op.
 */
export async function applyCheckoutSession(session: Stripe.Checkout.Session): Promise<SessionOutcome> {
  const orderId = session.metadata?.order_id;
  if (!orderId) return "unknown";

  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    return (await markOrderPaid(orderId, session.id)) ? "paid" : "unknown";
  }

  if (session.status === "expired") {
    await markOrderCancelled(orderId, session.id);
    return "cancelled";
  }

  // Delayed methods (e.g. SEPA debit) report completion later via webhook.
  return session.status === "complete" ? "processing" : "unknown";
}

/** Webhook events this store reacts to; everything else is acknowledged and ignored. */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
      await applyCheckoutSession(event.data.object);
      return;
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      if (session.metadata?.order_id) await markOrderCancelled(session.metadata.order_id, session.id);
      return;
    }
    default:
      return;
  }
}
