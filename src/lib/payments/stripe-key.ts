// Classifies STRIPE_SECRET_KEY without contacting Stripe. This store is a
// demo, so only TEST keys are accepted: a live key would take real money.
export type StripeKeyStatus = "missing" | "test" | "live" | "publishable" | "invalid";

export function stripeKeyStatus(key: string | undefined): StripeKeyStatus {
  const value = key?.trim();
  if (!value) return "missing";
  if (/^(sk|rk)_test_/.test(value)) return "test";
  if (/^(sk|rk)_live_/.test(value)) return "live";
  if (/^pk_/.test(value)) return "publishable";
  return "invalid";
}

export const STRIPE_KEY_PROBLEMS: Record<Exclude<StripeKeyStatus, "test" | "missing">, string> = {
  live:
    "STRIPE_SECRET_KEY is a LIVE key. This demo store only accepts test keys (sk_test_...), so payments are switched off.",
  publishable:
    "STRIPE_SECRET_KEY holds a publishable key (pk_...). Use the test SECRET key (sk_test_...) from Stripe > Developers > API keys.",
  invalid: "STRIPE_SECRET_KEY is not a Stripe secret key. Expected a value starting with sk_test_.",
};
