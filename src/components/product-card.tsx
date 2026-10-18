"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { Product } from '@/lib/types';
import { Heart, ShoppingCart } from 'lucide-react';

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
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden cursor-pointer h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full">
            <Image
              src={getImageUrl(product)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
              {isInCart && <Badge variant="default">In Cart ({cartQty})</Badge>}
            </div>
            <button
              aria-label="Toggle wishlist"
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(product.id);
              }}
              className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white transition-colors ${
                isInWishlist ? 'text-red-600' : 'text-slate-700'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 p-4 flex-1">
          <CardTitle className="text-base">{product.name}</CardTitle>
          <div className="text-sm opacity-70">
            {product.category} • {product.color}
          </div>
          <div className="text-lg font-semibold">{formatCurrency(product.price)}</div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <div className="text-xs opacity-70">
            Sizes: {product.size.join(', ')}
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product.id);
            }}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isInCart ? 'Add More' : 'Add to cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

// Simple product grid component for category pages
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
  emptyMessage = 'No products found',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const cartItem = cart.find((item) => item.id === product.id);
        return (
          <ProductCard
            key={product.id}
            product={product}
            isInCart={!!cartItem}
            cartQty={cartItem?.qty || 0}
            isInWishlist={wishlist.includes(product.id)}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        );
      })}
    </div>
  );
}

