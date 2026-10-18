"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from "lucide-react";
import { DEFAULT_PRODUCTS, LS_KEYS } from "@/lib/mock-data";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { Product } from "@/lib/types";

const LS = LS_KEYS;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ id: string; size?: string; qty: number }[]>([]);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
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
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(LS.CART);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }

    const storedProducts = localStorage.getItem(LS.PRODUCTS);
    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (e) {
        console.error("Error parsing products:", e);
      }
    }

    const savedUser = localStorage.getItem(LS.USER);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setForm((prev) => ({ ...prev, email: user.email }));
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const product = products.find((p) => p.id === item.id);
      return { ...item, product };
    });
  }, [cart, products]);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.qty, 0),
    [cartItems]
  );

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save order to localStorage (never store card details)
    const newOrderId = `ORD-${Date.now()}`;
    const newOrder = {
      id: newOrderId,
      date: new Date().toISOString(),
      email: form.email,
      items: cart,
      total,
      status: "pending" as const,
      shipping: {
        name: form.name,
        email: form.email,
        address: form.address,
        city: form.city,
        zip: form.zip,
        country: form.country,
      },
    };

    const storedOrders = localStorage.getItem(LS.ORDERS);
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    orders.unshift(newOrder);
    localStorage.setItem(LS.ORDERS, JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem(LS.CART);
    setCart([]);

    setOrderId(newOrderId);
    setOrderPlaced(true);
    setIsProcessing(false);
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">Thank you for your purchase.</p>
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
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>

        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <section>
                <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
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
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={form.zip}
                      onChange={(e) => handleChange("zip", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => handleChange("country", e.target.value)}
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
                      value={form.cardNumber}
                      onChange={(e) => handleChange("cardNumber", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={form.expiry}
                        onChange={(e) => handleChange("expiry", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={form.cvc}
                        onChange={(e) => handleChange("cvc", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                <span className="font-medium">Demo checkout — no payment is processed.</span> Don&apos;t
                enter real card details; nothing is charged or sent anywhere.
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? "Placing order..." : `Place Order · ${formatCurrency(total)}`}
              </Button>
            </form>
          </div>

          <div>
            <div className="sticky top-24 rounded-lg border bg-gray-50 p-6 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size || "default"}`} className="flex gap-4">
                    <div className="relative">
                      <Image
                        src={item.product ? getImageUrl(item.product) : ''}
                        alt={item.product?.name || "Product"}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-xs text-white">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.product?.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.product?.category} {item.size && `• Size: ${item.size}`}
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
                <span>Demo store — card details are never stored or transmitted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

