"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PriceNote } from "@/components/price-note";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, Heart, Share2, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useStore } from "@/components/store-provider";
import type { Product } from "@/lib/types";

// The server page has already checked that the product exists and set the
// page metadata; this component adds the interactive parts.
export function ProductDetail({ id }: { id: string }) {
  const router = useRouter();

  const {
    products,
    cart,
    wishlist,
    addToCart,
    toggleWishlist,
    notify,
  } = useStore();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setSelectedSize(null);
    setActiveImageIndex(0);
    setShareCopied(false);
  }, [id]);

  const product = useMemo(
    () => products.find((candidate) => candidate.id === id),
    [products, id]
  );

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return product.similarIds
      ?.map((similarId) =>
        products.find((candidate) => candidate.id === similarId)
      )
      .filter((candidate): candidate is Product => candidate !== undefined);
  }, [product, products]);

  const isInCart = useMemo(() => {
    if (!product) return false;
    return cart.some(
      (item) =>
        item.id === product.id && (!item.size || item.size === selectedSize)
    );
  }, [cart, product, selectedSize]);

  const cartItem = useMemo(() => {
    if (!product) return null;
    return cart.find(
      (item) =>
        item.id === product.id && (!item.size || item.size === selectedSize)
    );
  }, [cart, product, selectedSize]);

  const shareProduct = async () => {
    if (!product) return;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
    } catch {
      // fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      notify("Link copied to clipboard");
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      notify("Could not copy the link");
    }
  };

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="mb-4 font-display text-4xl">Product not found</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/")}>Back to store</Button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const isWishlisted = wishlist.includes(product.id);

  const needsSize = !selectedSize && (product.size?.length ?? 0) > 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize || product.size?.[0]);
  };

  return (
    <div className="min-h-[60vh] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border-2 border-ink bg-slate-200 shadow-[8px_8px_0_0_var(--shadow-ink)] dark:bg-slate-800">
              <ProductImage
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                    aria-pressed={activeImageIndex === index}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      activeImageIndex === index
                        ? "border-primary"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <ProductImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                {product.badge && <span className="sticker">{product.badge}</span>}
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <h1 className="font-display mt-3 text-5xl md:text-6xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <span>{product.color}</span>
              </div>
            </div>

            <div>
              <div className="font-display text-5xl">
                {formatCurrency(product.price)}
              </div>
              <PriceNote className="mt-1 text-sm" />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              <Link
                href="/versand-zahlung"
                className="flex items-center gap-2 hover:underline"
              >
                <Truck className="h-4 w-4" /> Free shipping from €
                {FREE_SHIPPING_THRESHOLD}
              </Link>
              <Link
                href="/widerruf"
                className="flex items-center gap-2 hover:underline"
              >
                <ShieldCheck className="h-4 w-4" /> 14-day right of withdrawal
              </Link>
            </div>

            <Separator />

            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider">Select size</h2>
              {needsSize && (
                <p id="size-hint" className="-mt-1 mb-3 text-sm text-slate-600 dark:text-slate-400">
                  Choose a size to add this item to your cart.
                </p>
              )}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select a size">
                {product.size?.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className="w-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="min-w-0 flex-1"
                size="lg"
                variant="brand"
                onClick={handleAddToCart}
                disabled={needsSize}
                aria-describedby={needsSize ? "size-hint" : undefined}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInCart ? `Add more (${cartItem?.qty || 0} in cart)` : "Add to cart"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-12 shrink-0"
                onClick={() => toggleWishlist(product.id)}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                aria-pressed={isWishlisted}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? "fill-brand text-brand" : ""
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-12 shrink-0"
                onClick={shareProduct}
                aria-label="Share product"
              >
                {shareCopied ? (
                  <>
                    <Check className="h-5 w-5 text-[#2f7d32] dark:text-sticker" aria-hidden="true" />
                    <span className="sr-only">Link copied</span>
                  </>
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2 rounded-2xl border-2 border-ink p-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Category</span>
                <span>{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Color</span>
                <span>{product.color}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium">Available sizes</span>
                <span className="text-right">{product.size?.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display mb-8 border-b-2 border-ink pb-4 text-4xl md:text-5xl">
              You may also like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/product/${similar.id}`}
                  className="lift group overflow-hidden rounded-2xl border-2 border-ink bg-card"
                >
                  <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-ink bg-slate-200 dark:bg-slate-800">
                    <ProductImage
                      src={getImageUrl(similar)}
                      alt={similar.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    {similar.badge && (
                      <span className="sticker absolute left-2 top-2">
                        {similar.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold">{similar.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-display text-xl">
                        {formatCurrency(similar.price)}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {similar.category}
                      </span>
                    </div>
                    <PriceNote plain />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
