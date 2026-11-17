import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ClearCartOnMount } from "@/components/clear-cart";
import { Button } from "@/components/ui/button";
import { getOrderRow, toOrder } from "@/lib/data/orders";
import { applyCheckoutSession } from "@/lib/payments/confirm";
import { getStripe } from "@/lib/payments/stripe";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

// Stripe sends the buyer here after payment. The page asks Stripe for the
// session itself; the URL parameter alone proves nothing.
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const stripe = getStripe();

  let outcome: "paid" | "processing" | "cancelled" | "unknown" = "unknown";
  let orderId: string | null = null;
  let total: number | null = null;

  if (stripe && typeof sessionId === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      outcome = await applyCheckoutSession(session);
      orderId = session.metadata?.order_id ?? null;
      const row = orderId ? await getOrderRow(orderId) : null;
      if (row && row.stripeSessionId === session.id) total = toOrder(row).total;
    } catch (error) {
      console.error("[payments] Could not verify Checkout Session:", error);
    }
  }

  const view = {
    paid: {
      icon: <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />,
      title: "Payment received",
      text: "Thank you for your order. This was a Stripe test payment: no real money was charged and nothing will be shipped.",
    },
    processing: {
      icon: <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />,
      title: "Payment processing",
      text: "Your order is placed and the payment is still being confirmed. Your order history will show when it completes.",
    },
    cancelled: {
      icon: <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />,
      title: "Payment not completed",
      text: "The payment session expired, so the order was cancelled. Your card has not been charged.",
    },
    unknown: {
      icon: <Clock className="h-12 w-12 opacity-60" />,
      title: "We could not confirm this payment",
      text: "If you completed a payment, it will appear in your order history shortly.",
    },
  }[outcome];

  return (
    <div className="min-h-[60vh] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {(outcome === "paid" || outcome === "processing") && <ClearCartOnMount />}
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">{view.icon}</div>
        <h1 className="mb-2 text-2xl font-bold">{view.title}</h1>
        <p className="mb-4 text-slate-600 dark:text-slate-400">{view.text}</p>
        {orderId && (
          <p className="mb-8 text-sm text-slate-500">
            Order ID: {orderId}
            {total !== null && <> · Total {formatCurrency(total)}</>}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/orders">View your orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continue shopping</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
