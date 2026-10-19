"use client";

import React from "react";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { Product } from "@/lib/types";
import { Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  isInCart: boolean;
  cartQty: number;
  isInWishlist: boolean;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}

export function ProductCard({
  product,
  isInCart,
  cartQty,
  isInWishlist,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const productUrl = `/product/${product.id}`;

  return (
    <Card className="group h-full gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="relative p-0">
        <Link
          href={productUrl}
          className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View ${product.name}`}
        >
          <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800">
            <ProductImage
              src={getImageUrl(product)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1">
          {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
          {isInCart && (
            <Badge variant="default">
              In Cart ({cartQty})
            </Badge>
          )}
        </div>

        <button
          type="button"
          aria-label={
            isInWishlist
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isInWishlist}
          onClick={() => onToggleWishlist(product.id)}
          className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 shadow transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isInWishlist ? "text-red-600 dark:text-red-400" : ""
          }`}
        >
          <Heart
            className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`}
          />
        </button>
      </CardHeader>

      <CardContent className="flex-1 space-y-1 p-4">
        <Link
          href={productUrl}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CardTitle className="line-clamp-1 text-base">
            {product.name}
          </CardTitle>
        </Link>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {product.category} · {product.color}
        </div>
        <div className="pt-1 text-lg font-semibold">
          {formatCurrency(product.price)}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 p-4 pt-0">
        <div className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
          Sizes: {product.size.join(", ") || "One size"}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => onAddToCart(product.id)}
          className="shrink-0"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="h-4 w-4" />
          {isInCart ? "Add more" : "Add"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ProductGridProps {
  products: Product[];
  cart: { id: string; size?: string; qty: number }[];
  wishlist: string[];
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  cart,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  emptyMessage = "No products found",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
        <ShoppingCart className="mx-auto mb-3 h-8 w-8 opacity-40" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const lines = cart.filter((item) => item.id === product.id);
        const cartQty = lines.reduce((sum, item) => sum + item.qty, 0);

        return (
          <ProductCard
            key={product.id}
            product={product}
            isInCart={lines.length > 0}
            cartQty={cartQty}
            isInWishlist={wishlist.includes(product.id)}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        );
      })}
    </div>
  );
}
