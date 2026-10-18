"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, Share2, ShoppingCart } from "lucide-react";
import { DEFAULT_PRODUCTS, LS_KEYS } from "@/lib/mock-data";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { Product } from "@/lib/types";

const LS = LS_KEYS;

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState<{ id: string; size?: string; qty: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS.PRODUCTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      } catch (e) {
        console.error("Error parsing stored products:", e);
      }
    }

    const storedCart = localStorage.getItem(LS.CART);
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }

    const storedWishlist = localStorage.getItem(LS.WISHLIST);
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart:", e);
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Error saving wishlist:", e);
    }
  }, [wishlist, isLoaded]);

  const shareProduct = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url });
        return;
      }
    } catch {
      // fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      console.error("Could not copy link");
    }
  };

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return product.similarIds
      ?.map((sid) => products.find((p) => p.id === sid))
      .filter((p): p is Product => p !== undefined);
  }, [product, products]);

  const isInCart = useMemo(() => {
    if (!product) return false;
    return cart.some((item) => item.id === product.id && (!item.size || item.size === selectedSize));
  }, [cart, product, selectedSize]);

  const cartItem = useMemo(() => {
    if (!product) return null;
    return cart.find((item) => item.id === product.id && (!item.size || item.size === selectedSize));
  }, [cart, product, selectedSize]);

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

  const addToCart = () => {
    const size = selectedSize || product.size?.[0];
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id && (!item.size || item.size === size));
      if (found) {
        return prev.map((item) =>
          item.id === product.id && (!item.size || item.size === size)
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { id: product.id, size, qty: 1 }];
    });
  };

  const toggleWishlist = () => {
    setWishlist((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const images = product.images || [];

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
              {images[activeImageIndex] ? (
                <Image
                  src={images[activeImageIndex]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-96 items-center justify-center text-gray-400">No image</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                      activeImageIndex === idx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span>{product.color}</span>
              </div>
            </div>

            <div className="text-3xl font-bold">{formatCurrency(product.price)}</div>

            <Separator />

            <div>
              <h3 className="mb-2 font-medium">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.size?.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
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
                onClick={addToCart}
                disabled={!selectedSize && product.size && product.size.length > 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInCart ? `Add More (${cartItem?.qty || 0})` : "Add to Cart"}
              </Button>
              <Button variant="outline" size="lg" onClick={toggleWishlist}>
                <Heart
                  className={`h-5 w-5 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
              <Button variant="outline" size="lg" onClick={shareProduct}>
                {shareCopied ? (
                  <span className="flex items-center gap-2 text-sm">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
              <div className="flex justify-between">
                <span className="font-medium">Available Sizes</span>
                <span>{product.size?.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Similar Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((p) => (
                <div
                  key={p.id}
                  className="cursor-pointer rounded-xl border p-3 transition-shadow hover:shadow-lg"
                  onClick={() => router.push(`/product/${p.id}`)}
                >
                  <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800">
                    <Image
                      src={getImageUrl(p)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {p.badge && <Badge className="absolute left-2 top-2">{p.badge}</Badge>}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{formatCurrency(p.price)}</span>
                      <span className="text-xs text-gray-500">{p.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

