"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { DEFAULT_PRODUCTS, LS_KEYS } from "@/lib/mock-data";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { Product } from "@/lib/types";

const LS = LS_KEYS;

interface Order {
  id: string;
  date: string;
  email?: string;
  items: { id: string; size?: string; qty: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  shipping: {
    name: string;
    email?: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem(LS.USER);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing user:", e);
        }
      }

      const storedOrders = localStorage.getItem(LS.ORDERS);
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch (e) {
          console.error("Error parsing orders:", e);
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
    }
  }, []);

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const userOrders = user
    ? orders.filter((o) => o.email === user.email || o.shipping?.email === user.email)
    : [];

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Login</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You need to login to view your orders.
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
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>

        <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

        <div className="space-y-6">
          {userOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
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
                      {order.items.map((item, idx) => {
                        const product = getProduct(item.id);
                        return (
                          <div key={`${item.id}-${item.size || idx}`} className="flex items-center gap-3">
                            <Image
                              src={product ? getImageUrl(product) : ''}
                              alt={product?.name || "Product"}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{product?.name}</div>
                              <div className="text-sm text-gray-500">
                                Qty: {item.qty}
                                {item.size && ` • Size: ${item.size}`}
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency((product?.price || 0) * item.qty)}
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

