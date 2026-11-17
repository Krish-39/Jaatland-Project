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
    <article className="lift group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card">
      <div className="relative">
        <Link
          href={productUrl}
          className="block overflow-hidden"
          aria-label={`View ${product.name}`}
        >
          <div className="relative aspect-[4/5] w-full border-b-2 border-ink bg-slate-200 dark:bg-slate-800">
            <ProductImage
              src={getImageUrl(product)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-500 group-hover:scale-[1.05]"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && <span className="sticker">{product.badge}</span>}
          {isInCart && (
            <span className="inline-flex items-center rounded-full border-2 border-[#1a1815] bg-brand px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#1a1815]">
              In cart · {cartQty}
            </span>
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
          className={`absolute right-3 top-3 grid size-10 place-items-center rounded-full border-2 border-[#1a1815] shadow-[2px_2px_0_0_#1a1815] transition-transform hover:scale-110 ${
            isInWishlist ? "bg-brand text-[#1a1815]" : "bg-[#fbf8f1] text-[#1a1815]"
          }`}
        >
          <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={productUrl} className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold leading-snug">
              {product.name}
            </h3>
          </Link>
          <div className="shrink-0 text-right">
            <div className="font-display text-2xl leading-none">
              {formatCurrency(product.price)}
            </div>
          </div>
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {product.category} · {product.color}
        </div>
        <PriceNote className="mt-1" />

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="min-w-0 truncate text-xs text-slate-600 dark:text-slate-400">
            {product.size.join(" · ") || "One size"}
          </div>
          <Button
            type="button"
            size="sm"
            variant="brand"
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
      <div className="rounded-2xl border-2 border-dashed border-ink px-6 py-16 text-center">
        <ShoppingCart className="mx-auto mb-3 h-8 w-8 opacity-40" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
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
