"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { ProductDetailSkeleton } from "@/components/product-grid-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, Share2, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useStore } from "@/components/store-provider";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    products,
    isLoaded,
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize || product.size?.[0]);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800">
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
                {product.badge && (
                  <Badge variant="secondary">{product.badge}</Badge>
                )}
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{product.color}</span>
              </div>
            </div>

            <div className="text-3xl font-bold">
              {formatCurrency(product.price)}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> Free EU shipping over €40
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> 30-day returns
              </span>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-medium">Select Size</h3>
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
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={!selectedSize && product.size && product.size.length > 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInCart ? `Add More (${cartItem?.qty || 0})` : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toggleWishlist(product.id)}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                aria-pressed={isWishlisted}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={shareProduct}
                aria-label="Share product"
              >
                {shareCopied ? (
                  <span className="flex items-center gap-2 text-sm">
                    <svg
                      className="h-5 w-5 text-green-600"
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
                    Copied!
                  </span>
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Category</span>
                <span>{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Color</span>
                <span>{product.color}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium">Available Sizes</span>
                <span className="text-right">{product.size?.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Similar Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/product/${similar.id}`}
                  className="group cursor-pointer rounded-xl border p-3 transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800">
                    <ProductImage
                      src={getImageUrl(similar)}
                      alt={similar.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    {similar.badge && (
                      <Badge className="absolute left-2 top-2">
                        {similar.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium">{similar.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        {formatCurrency(similar.price)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {similar.category}
                      </span>
                    </div>
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
