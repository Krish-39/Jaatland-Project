"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { ShowcaseNotice } from "@/components/showcase-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { LS_KEYS } from "@/lib/mock-data";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { placeOrderAction } from "@/app/actions/orders";
import { orderTotalFor, shippingCostFor } from "@/lib/shipping";
import { readArray, readJson, writeJson } from "@/lib/storage";
import { useStore } from "@/components/store-provider";

const LS = LS_KEYS;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, products, clearCart, isLoaded, user, showcase, payments } =
    useStore();
  const [form, setForm] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    zip: "",
    country: "Germany",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  // Stripe sends the buyer back with ?payment=cancelled when they leave the
  // payment page. The cart is untouched, so they can simply try again.
  useEffect(() => {
    setPaymentCancelled(
      new URLSearchParams(window.location.search).get("payment") === "cancelled"
    );
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Prefill from the logged-in user, or from the last guest checkout on this
    // browser so returning guests don't retype their email.
    const buyerEmail = readJson<string>(LS.BUYER_EMAIL, "");
    const email = user?.email || buyerEmail;
    if (!email) return;

    setForm((prev) =>
      prev.email ? prev : { ...prev, email }
    );
  }, [isLoaded, user]);

  const cartItems = useMemo(
    () =>
      cart.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.id),
      })),
    [cart, products]
  );

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.qty,
        0
      ),
    [cartItems]
  );
  const shippingCost = shippingCostFor(total);
  const grandTotal = orderTotalFor(total);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (cart.length === 0 || showcase) return;

    setIsProcessing(true);
    setSubmitError("");

    try {
      const email = form.email.trim();
      // The server looks up every product and computes the prices itself;
      // only ids, sizes and quantities are sent. Card details are entered on
      // Stripe's own payment page and never reach this site.
      const result = await placeOrderAction({
        email,
        name: form.name,
        address: form.address,
        city: form.city,
        zip: form.zip,
        items: cart.map((line) => ({ id: line.id, size: line.size, qty: line.qty })),
      });

      if (!result.ok) {
        setSubmitError(result.error);
        setIsProcessing(false);
        return;
      }

      // Guests keep a private token so this browser can show the order later.
      if (result.accessToken) {
        const refs = readArray<{ id: string; token: string }>(LS.GUEST_ORDERS);
        writeJson(
          LS.GUEST_ORDERS,
          [{ id: result.orderId, token: result.accessToken }, ...refs].slice(0, 25)
        );
      }
      writeJson(LS.BUYER_EMAIL, email);

      if (result.paymentUrl) {
        // Hand over to Stripe Checkout. The cart is cleared on the success
        // page, once the payment is confirmed, so cancelling keeps it.
        // The button stays in its "processing" state while the browser leaves.
        window.location.assign(result.paymentUrl);
        return;
      }

      clearCart();

      setOrderId(result.orderId);
      setOrderPlaced(true);
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      setSubmitError("Something went wrong placing your order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
          <span className="text-sm opacity-70">Loading your cart…</span>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
              <svg
                className="h-12 w-12 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Order confirmed</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Thank you for your order.
          </p>
          <p className="mb-8 text-sm text-gray-500">Order ID: {orderId}</p>
          <Button onClick={() => router.push("/orders")}>View your orders</Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Add some products to your cart to proceed with checkout.
          </p>
          <Button onClick={() => router.push("/")}>Continue shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Button>

        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <section>
                <h2 className="mb-4 text-xl font-semibold">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) =>
                        handleChange("email", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) =>
                        handleChange("name", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(event) =>
                        handleChange("address", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(event) =>
                        handleChange("city", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      title="5-digit German postal code"
                      value={form.zip}
                      onChange={(event) =>
                        handleChange("zip", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      autoComplete="country-name"
                      value={form.country}
                      readOnly
                      aria-describedby="country-hint"
                    />
                    <p
                      id="country-hint"
                      className="mt-1 text-xs text-slate-500 dark:text-slate-400"
                    >
                      Delivery within Germany only.
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h2>
                {payments ? (
                  <div className="space-y-3 text-sm">
                    <p>
                      After you place the order you are taken to Stripe&apos;s
                      secure payment page to pay by card. Card details are
                      entered there and never reach this site.
                    </p>
                    <p className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                      <span className="font-medium">Stripe test mode:</span> no
                      real money is charged and nothing is shipped. Pay with the
                      test card <code>4242 4242 4242 4242</code>, any future
                      expiry date and any CVC. Do not enter a real card.
                    </p>
                  </div>
                ) : (
                  <p className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                    <span className="font-medium">Demo checkout:</span> payment
                    is not connected in this deployment, so the order is placed
                    without a payment step. Nothing is charged or shipped.
                  </p>
                )}
              </section>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Our{" "}
                <Link href="/agb" className="underline underline-offset-2">
                  Terms
                </Link>{" "}
                apply. Please note the{" "}
                <Link href="/widerruf" className="underline underline-offset-2">
                  right of withdrawal
                </Link>{" "}
                and our{" "}
                <Link
                  href="/datenschutz"
                  className="underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              {submitError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
                >
                  {submitError}
                </p>
              )}

              {/* § 312j BGB: the goods, total price and shipping must be shown
                  directly above the order button, on every screen size. */}
              <section
                aria-labelledby="order-recap-heading"
                className="rounded-lg border p-4 text-sm"
              >
                <h2 id="order-recap-heading" className="mb-2 font-semibold">
                  Your order
                </h2>
                <ul className="space-y-1">
                  {cartItems.map((item) => (
                    <li
                      key={`recap-${item.id}-${item.size || "default"}`}
                      className="flex justify-between gap-4"
                    >
                      <span>
                        {item.qty} × {item.product?.name ?? "Unavailable item"}
                        {item.size ? `, size ${item.size}` : ""}
                      </span>
                      <span>
                        {formatCurrency((item.product?.price || 0) * item.qty)}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-4">
                    <span>Shipping (Germany)</span>
                    <span>
                      {shippingCost === 0
                        ? "Free"
                        : formatCurrency(shippingCost)}
                    </span>
                  </li>
                </ul>
                <div className="mt-2 flex justify-between gap-4 border-t pt-2 font-semibold">
                  <span>Total incl. VAT</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </section>

              {showcase && <ShowcaseNotice />}

              {paymentCancelled && !submitError && (
                <p
                  role="status"
                  className="rounded-lg border p-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  Payment was cancelled and nothing was charged. Your cart is
                  unchanged, so you can try again.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isProcessing || showcase}
              >
                {isProcessing
                  ? payments
                    ? "Opening secure payment…"
                    : "Placing order…"
                  : `Order with obligation to pay · ${formatCurrency(grandTotal)}`}
              </Button>
            </form>
          </div>

          <div>
            <div className="sticky top-24 rounded-lg border bg-gray-50 p-6 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size || "default"}`}
                    className="flex gap-4"
                  >
                    <div className="relative">
                      <ProductImage
                        src={item.product ? getImageUrl(item.product) : ""}
                        alt={item.product?.name || "Product"}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg"
                      />
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs text-white">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.product?.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.product?.category}{" "}
                        {item.size && `• Size: ${item.size}`}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency((item.product?.price || 0) * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    <Link
                      href="/versand-zahlung"
                      className="underline underline-offset-2"
                    >
                      Shipping
                    </Link>{" "}
                    (Germany)
                  </span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                incl. VAT
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {payments
                    ? "Payments by Stripe (test mode)"
                    : "Demo store: no payment is taken"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
