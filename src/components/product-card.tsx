"use client";

import React from "react";
import Link from "next/link";
import { PriceNote } from "@/components/price-note";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
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
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-lg bg-muted">
        <Link href={productUrl} className="block" aria-label={`View ${product.name}`}>
          <div className="relative aspect-[4/5] w-full">
            <ProductImage
              src={getImageUrl(product)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && <span className="label-chip">{product.badge}</span>}
          {isInCart && (
            <span className="label-chip bg-[#1c1917] text-white">In cart · {cartQty}</span>
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
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-[#1c1917] shadow-sm backdrop-blur transition hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-start justify-between gap-3">
          <Link href={productUrl} className="min-w-0">
            <h3 className="line-clamp-2 text-[0.9375rem] font-medium leading-snug hover:underline">
              {product.name}
            </h3>
          </Link>
          <div className="shrink-0 text-[0.9375rem] font-semibold tabular-nums">
            {formatCurrency(product.price)}
          </div>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {product.color} · {product.category}
        </div>
        <PriceNote className="mt-0.5" />

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="min-w-0 truncate text-xs text-muted-foreground">
            {product.size.join(" · ") || "One size"}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAddToCart(product.id)}
            className="shrink-0"
            aria-label={`${isInCart ? "Add more" : "Add"} ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
            {isInCart ? "Add more" : "Add"}
          </Button>
        </div>
      </div>
    </article>
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
      <div className="rounded-lg border border-dashed px-6 py-16 text-center">
        <ShoppingCart className="mx-auto mb-3 h-8 w-8 opacity-40" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
