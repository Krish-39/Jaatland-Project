import "server-only";
import Stripe from "stripe";
import { STRIPE_KEY_PROBLEMS, stripeKeyStatus } from "./stripe-key";

const globalForStripe = globalThis as unknown as {
  jaatlandStripe?: Stripe | null;
  jaatlandStripeWarned?: boolean;
};

/**
 * The Stripe client, or null when payments are off: no key, or a key that is
 * not a test secret key. Without Stripe the checkout falls back to placing a
 * demo order with no payment step.
 */
export function getStripe(): Stripe | null {
  if (globalForStripe.jaatlandStripe !== undefined) return globalForStripe.jaatlandStripe;

  const key = process.env.STRIPE_SECRET_KEY;
  const status = stripeKeyStatus(key);

  if (status !== "test") {
    if (status !== "missing" && !globalForStripe.jaatlandStripeWarned) {
      globalForStripe.jaatlandStripeWarned = true;
      console.error(`[payments] ${STRIPE_KEY_PROBLEMS[status]}`);
    }
    globalForStripe.jaatlandStripe = null;
    return null;
  }

  globalForStripe.jaatlandStripe = new Stripe(key!.trim(), {
    appInfo: { name: "Jaatland demo store" },
    maxNetworkRetries: 2,
    timeout: 20_000,
    ...localApiOverride(),
  });
  return globalForStripe.jaatlandStripe;
}

export function paymentsEnabled(): boolean {
  return getStripe() !== null;
}

/** STRIPE_API_URL points the client at a local Stripe stand-in such as
 * stripe-mock, for automated tests. Only localhost is accepted, so a
 * misconfigured deployment can never send payment calls elsewhere. */
function localApiOverride(): { host: string; port: number; protocol: "http" | "https" } | object {
  const raw = process.env.STRIPE_API_URL?.trim();
  if (!raw) return {};

  const url = new URL(raw);
  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    console.error("[payments] Ignoring STRIPE_API_URL: only localhost is allowed.");
    return {};
  }
  return {
    host: url.hostname,
    port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
    protocol: url.protocol === "https:" ? "https" : "http",
  };
}
