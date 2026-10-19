"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { useStore } from "@/components/store-provider";
import { useProductFilters } from "@/hooks/use-product-filters";
import { CATEGORIES, LS_KEYS } from "@/lib/mock-data";
import { readString, writeString } from "@/lib/storage";
import type { Product } from "@/lib/types";

const CATEGORY_COPY: Record<string, string> = {
  Men: "Premium wear for the modern man",
  Women: "Stylish pieces for every occasion",
  Unisex: "Styles for everyone",
  Accessories: "Complete your look",
};

function categoryHeading(category: string) {
  if (category === "Accessories") return "Accessories";
  if (category === "Unisex") return "Unisex Collection";
  return `${category}'s Collection`;
}

export default function Jaatland() {
  const {
    products,
    homepageConfig,
    isLoaded,
    cart,
    wishlist,
    addToCart,
    toggleWishlist,
  } = useStore();
  const filters = useProductFilters(products, isLoaded);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(readString(LS_KEYS.THEME) === "dark");
  }, []);

  const toggleDark = () => {
    setDark((previous) => {
      const next = !previous;
      document.documentElement.classList.toggle("dark", next);
      writeString(LS_KEYS.THEME, next ? "dark" : "light");
      return next;
    });
  };

  const handleAddToCart = (id: string) => {
    const product = products.find((candidate) => candidate.id === id);
    if (product) addToCart(product);
  };

  const featuredProducts = useMemo(() => {
    const featuredIds = homepageConfig.homepageProducts;
    const hasFeaturedProducts = Object.values(featuredIds).some(
      (ids) => ids.length > 0
    );

    if (hasFeaturedProducts) {
      const selected = products.filter(
        (product) =>
          featuredIds.Men?.includes(product.id) ||
          featuredIds.Women?.includes(product.id) ||
          featuredIds.Unisex?.includes(product.id) ||
          featuredIds.Accessories?.includes(product.id)
      );
      if (selected.length > 0) return selected;
    }

    // Show a mix of products from different categories.
    const allFeatured: Product[] = [];
    (CATEGORIES as readonly string[]).forEach((category) => {
      allFeatured.push(
        ...products.filter((product) => product.category === category).slice(0, 3)
      );
    });
    return allFeatured;
  }, [products, homepageConfig]);

  const visibleCategories = useMemo(
    () =>
      CATEGORIES.filter((category) =>
        products.some((product) => product.category === category)
      ),
    [products]
  );

  const resultTitle = filters.query.trim()
    ? `Results for “${filters.query.trim()}”`
    : filters.category
      ? categoryHeading(filters.category)
      : "Filtered products";

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <StoreHeader filters={filters} dark={dark} onToggleDark={toggleDark} />

      {!filters.hasActiveFilters && <Hero config={homepageConfig} />}

      <main
        id="products"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 pt-10"
      >
        {!isLoaded ? (
          <ProductGridSkeleton />
        ) : filters.hasActiveFilters ? (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {resultTitle}
                </h2>
                <p
                  className="mt-1 text-sm opacity-70"
                  aria-live="polite"
                >
                  {filters.filtered.length}{" "}
                  {filters.filtered.length === 1 ? "item" : "items"}
                  {filters.category && filters.query.trim()
                    ? ` in ${filters.category}`
                    : ""}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={filters.clearFilters}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" /> Clear all
              </Button>
            </div>
            <ProductGrid
              products={filters.filtered}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={handleAddToCart}
              onToggleWishlist={toggleWishlist}
              emptyMessage="No products match your filters. Try clearing some criteria."
            />
          </>
        ) : (
          <div className="space-y-16">
            <section id="featured" className="scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Featured Products
                  </h2>
                  <p className="mt-1 text-sm opacity-70">
                    Hand-picked pieces from the latest drop.
                  </p>
                </div>
                <span className="text-sm opacity-70">
                  {featuredProducts.length}{" "}
                  {featuredProducts.length === 1 ? "item" : "items"}
                </span>
              </div>
              <ProductGrid
                products={featuredProducts}
                cart={cart}
                wishlist={wishlist}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
                emptyMessage="No featured products yet."
              />
            </section>

            {visibleCategories.map((category) => {
              const categoryProducts = products.filter(
                (product) => product.category === category
              );

              return (
                <section
                  key={category}
                  id={`category-${category.toLowerCase()}`}
                  className="scroll-mt-24"
                >
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {categoryHeading(category)}
                      </h2>
                      <p className="mt-1 text-sm opacity-70">
                        {CATEGORY_COPY[category]}
                      </p>
                    </div>
                    <span className="text-sm opacity-70">
                      {categoryProducts.length}{" "}
                      {categoryProducts.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <ProductGrid
                    products={categoryProducts}
                    cart={cart}
                    wishlist={wishlist}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={toggleWishlist}
                  />
                </section>
              );
            })}
          </div>
        )}
      </main>

      <StoreFooter onSelectCategory={filters.setCategory} />
    </div>
  );
}
