"use client";

import React, { useMemo } from "react";
import { X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryTiles } from "@/components/category-tiles";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { ProductGrid } from "@/components/product-card";
import { useStore } from "@/components/store-provider";
import { useFilters } from "@/components/filters-provider";
import { CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/lib/types";

const CATEGORY_COPY: Record<string, string> = {
  Men: "Everyday essentials for men",
  Women: "Everyday essentials for women",
  Unisex: "Designed to be worn by everyone",
  Accessories: "Bags and everyday accessories",
};

function categoryHeading(category: string) {
  if (category === "Accessories") return "Accessories";
  if (category === "Unisex") return "Unisex Collection";
  return `${category}'s Collection`;
}

function SectionHeading({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
      <div>
        <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
      <span className="sticker">
        {count} {count === 1 ? "item" : "items"}
      </span>
    </div>
  );
}

export default function Jaatland() {
  const {
    products,
    homepageConfig,
    cart,
    wishlist,
    addToCart,
    toggleWishlist,
  } = useStore();
  const filters = useFilters();

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
    <div className="min-h-[60vh]">
      {!filters.hasActiveFilters && (
        <>
          <Hero config={homepageConfig} />
          <Marquee />
        </>
      )}

      <main
        id="products"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 pt-12"
      >
        {filters.hasActiveFilters ? (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-4xl md:text-5xl">
                  {resultTitle}
                </h2>
                <p
                  className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400"
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
          <div className="space-y-20">
            <CategoryTiles />

            <section id="featured" className="scroll-mt-24">
              <SectionHeading
                title="Featured products"
                subtitle="A selection from the current collection."
                count={featuredProducts.length}
              />
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
                  <SectionHeading
                    title={categoryHeading(category)}
                    subtitle={CATEGORY_COPY[category]}
                    count={categoryProducts.length}
                  />
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

    </div>
  );
}
