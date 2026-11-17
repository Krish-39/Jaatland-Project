import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/payments/stripe";
import { handleStripeEvent } from "@/lib/payments/confirm";

// Stripe calls this endpoint to report payments, including ones the buyer
// never returned to the site for. Optional: the success page also confirms
// payments, but only the webhook catches delayed payments and expiries.
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // The signature covers the raw body, so read it as text, unparsed.
  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (error) {
    console.error(`[payments] Webhook ${event.type} (${event.id}) failed:`, error);
    // A 500 makes Stripe retry the event later.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
