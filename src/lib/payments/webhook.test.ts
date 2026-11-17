import Stripe from "stripe";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getProducts } from "@/lib/data/catalog";
import { attachStripeSession, createOrderRecord, getOrderRow, markOrderPaid } from "@/lib/data/orders";

const WEBHOOK_SECRET = "whsec_test_secret";
vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);

const { POST } = await import("@/app/api/stripe/webhook/route");
const signer = new Stripe("sk_test_dummy");

function sessionEvent(type: string, session: Partial<Stripe.Checkout.Session>) {
  return JSON.stringify({
    id: `evt_${Math.random().toString(36).slice(2)}`,
    object: "event",
    type,
    data: { object: { object: "checkout.session", ...session } },
  });
}

function webhookRequest(payload: string, signature?: string) {
  return new NextRequest("http://localhost/api/stripe/webhook", {
    method: "POST",
    body: payload,
    headers: {
      "stripe-signature":
        signature ?? signer.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET }),
    },
  });
}

describe("payments against an in-memory database", () => {
  let orderId: string;

  beforeAll(async () => {
    const created = await createOrderRecord({
      userId: null,
      email: "buyer@example.com",
      cart: [{ id: "p1", size: "M", qty: 1 }],
      catalog: await getProducts(),
      shipping: { name: "T", address: "Teststr. 1", city: "Berlin", zip: "10115" },
    });
    orderId = created.id;
    await attachStripeSession(orderId, "cs_test_good");
  });

  it("refuses to mark an order paid by a session that is not its own", async () => {
    expect(await markOrderPaid(orderId, "cs_test_someone_else")).toBe(false);
    expect((await getOrderRow(orderId))?.status).toBe("pending");
  });

  it("rejects webhook calls with a bad signature", async () => {
    const payload = sessionEvent("checkout.session.completed", {
      id: "cs_test_good",
      payment_status: "paid",
      status: "complete",
      metadata: { order_id: orderId },
    });
    const response = await POST(webhookRequest(payload, "t=1,v1=forged"));
    expect(response.status).toBe(400);
    expect((await getOrderRow(orderId))?.status).toBe("pending");
  });

  it("marks the order paid on a signed checkout.session.completed, once", async () => {
    const payload = sessionEvent("checkout.session.completed", {
      id: "cs_test_good",
      payment_status: "paid",
      status: "complete",
      metadata: { order_id: orderId },
    });

    expect((await POST(webhookRequest(payload))).status).toBe(200);
    const first = await getOrderRow(orderId);
    expect(first?.status).toBe("paid");
    expect(first?.paidAt).toBeInstanceOf(Date);

    // Stripe retries deliveries; a repeat must not change anything.
    expect((await POST(webhookRequest(payload))).status).toBe(200);
    expect((await getOrderRow(orderId))?.paidAt?.getTime()).toBe(first?.paidAt?.getTime());
  });

  it("does not cancel an order that is already paid when a session expires", async () => {
    const payload = sessionEvent("checkout.session.expired", {
      id: "cs_test_good",
      payment_status: "unpaid",
      status: "expired",
      metadata: { order_id: orderId },
    });
    expect((await POST(webhookRequest(payload))).status).toBe(200);
    expect((await getOrderRow(orderId))?.status).toBe("paid");
  });

  it("cancels an unpaid order when its session expires", async () => {
    const created = await createOrderRecord({
      userId: null,
      email: "buyer@example.com",
      cart: [{ id: "p6", size: "One", qty: 1 }],
      catalog: await getProducts(),
      shipping: { name: "T", address: "Teststr. 1", city: "Berlin", zip: "10115" },
    });
    await attachStripeSession(created.id, "cs_test_expiring");

    const payload = sessionEvent("checkout.session.expired", {
      id: "cs_test_expiring",
      payment_status: "unpaid",
      status: "expired",
      metadata: { order_id: created.id },
    });
    expect((await POST(webhookRequest(payload))).status).toBe(200);
    expect((await getOrderRow(created.id))?.status).toBe("cancelled");
  });
});
