"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { LS_KEYS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { orderBelongsTo, resolveOrderItem } from "@/lib/orders";
import { readJson } from "@/lib/storage";
import { useStore } from "@/components/store-provider";
import type { Order } from "@/lib/types";

const LS = LS_KEYS;

function statusClasses(status: Order["status"]) {
  switch (String(status).toLowerCase()) {
    case "pending":
      return "bg-amber-500 text-white";
    case "processing":
      return "bg-blue-600 text-white";
    case "shipped":
      return "bg-purple-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "cancelled":
      return "bg-red-600 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const { products, user, isLoaded } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  useEffect(() => {
    const storedOrders = readJson<Order[]>(LS.ORDERS, []);
    setOrders(Array.isArray(storedOrders) ? storedOrders : []);
    setBuyerEmail(readJson<string>(LS.BUYER_EMAIL, ""));
    setOrdersLoaded(true);
  }, []);

  // Logged-in users see their account's orders; guests see the orders placed
  // with the email used at the last checkout on this browser.
  const viewerEmail = user?.email || buyerEmail || "";
  const userOrders = viewerEmail
    ? orders.filter((order) => orderBelongsTo(order, viewerEmail))
    : [];

  if (!isLoaded || !ordersLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
          <span className="text-sm opacity-70">Loading your orders…</span>
        </div>
      </div>
    );
  }

  if (!viewerEmail) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">No Orders Yet</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Place an order or log in to see your order history.
          </p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h1 className="mb-4 text-2xl font-bold">No Orders Yet</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You haven&apos;t placed any orders yet.
          </p>
          <Button onClick={() => router.push("/")}>Start Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>

        <h1 className="mb-2 text-3xl font-bold">My Orders</h1>
        <p className="mb-8 text-sm text-gray-500">
          {user
            ? `Signed in as ${viewerEmail}`
            : `Showing orders placed on this browser as ${viewerEmail}`}
        </p>

        <div className="space-y-6">
          {userOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="text-lg">
                    Order #{order.id}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge className={statusClasses(order.status)}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString("en-IE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Package className="h-4 w-4" />
                      Items
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const { name, image, unitPrice } = resolveOrderItem(
                          item,
                          products
                        );
                        return (
                          <div
                            key={`${item.id}-${item.size || index}`}
                            className="flex items-center gap-3"
                          >
                            <ProductImage
                              src={image}
                              alt={name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{name}</div>
                              <div className="text-sm text-gray-500">
                                Qty: {item.qty}
                                {item.size && ` • Size: ${item.size}`}
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(unitPrice * item.qty)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>{order.shipping.name}</div>
                        <div>{order.shipping.address}</div>
                        <div>
                          {order.shipping.city}, {order.shipping.zip}
                        </div>
                        <div>{order.shipping.country}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <CreditCard className="h-4 w-4" />
                        Payment Summary
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>Free</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
