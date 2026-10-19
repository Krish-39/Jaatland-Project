"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { LS_KEYS } from "@/lib/mock-data";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { createOrder } from "@/lib/orders";
import { readJson, writeJson } from "@/lib/storage";
import { useStore } from "@/components/store-provider";
import type { Order } from "@/lib/types";

const LS = LS_KEYS;

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, products, clearCart, isLoaded, user } = useStore();
  const [form, setForm] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    zip: "",
    country: "Germany",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

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

  const handleChange = (field: string, value: string) => {
    let next = value;

    if (field === "cardNumber") next = formatCardNumber(value);
    if (field === "expiry") next = formatExpiry(value);
    if (field === "cvc") next = value.replace(/\D/g, "").slice(0, 4);

    setForm((prev) => ({ ...prev, [field]: next }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setSubmitError("");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const email = form.email.trim();
      const newOrder = createOrder({
        cart,
        products,
        email,
        shipping: {
          name: form.name,
          address: form.address,
          city: form.city,
          zip: form.zip,
          country: form.country,
        },
      });

      if (newOrder.items.length !== cart.length) {
        throw new Error(
          "Some items in your cart are no longer available. Please update your cart and try again."
        );
      }

      // Never store card details. Only the order, with prices snapshotted.
      const existingOrders = readJson<Order[]>(LS.ORDERS, []);
      const safeOrders = Array.isArray(existingOrders) ? existingOrders : [];
      if (!writeJson(LS.ORDERS, [newOrder, ...safeOrders])) {
        throw new Error(
          "Could not save your order. Check that browser storage is enabled and try again."
        );
      }

      // Remember the buyer so guest orders are visible on /orders too.
      writeJson(LS.BUYER_EMAIL, email);

      clearCart();

      setOrderId(newOrder.id);
      setOrderPlaced(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong placing your order. Please try again."
      );
    } finally {
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
          <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Thank you for your purchase.
          </p>
          <p className="mb-8 text-sm text-gray-500">Order ID: {orderId}</p>
          <Button onClick={() => router.push("/orders")}>View Orders</Button>
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
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
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
          Back to Store
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
                      onChange={(event) =>
                        handleChange("country", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19}
                      value={form.cardNumber}
                      onChange={(event) =>
                        handleChange("cardNumber", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        maxLength={5}
                        value={form.expiry}
                        onChange={(event) =>
                          handleChange("expiry", event.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={4}
                        value={form.cvc}
                        onChange={(event) =>
                          handleChange("cvc", event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                <span className="font-medium">
                  Demo checkout — no payment is processed.
                </span>{" "}
                Don&apos;t enter real card details; nothing is charged or sent
                anywhere.
              </div>

              {submitError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
                >
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Placing order..."
                  : `Place Order · ${formatCurrency(total)}`}
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
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="h-4 w-4" />
                <span>
                  Demo store — card details are never stored or transmitted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
