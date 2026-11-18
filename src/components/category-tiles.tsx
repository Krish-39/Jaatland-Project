"use client";

import { ArrowRight } from "lucide-react";
import { useFilters } from "@/components/filters-provider";
import { ProductImage } from "@/components/product-image";
import { useStore } from "@/components/store-provider";
import { CATEGORIES } from "@/lib/mock-data";
import { getImageUrl } from "@/lib/utils";

/** Image tiles that jump straight into a category. */
export function CategoryTiles() {
  const { setCategory } = useFilters();
  const { products } = useStore();

  const tiles = CATEGORIES.map((category) => {
    const inCategory = products.filter((product) => product.category === category);
    return { category, count: inCategory.length, image: inCategory[0] ? getImageUrl(inCategory[0]) : "" };
  }).filter((tile) => tile.count > 0);

  return (
    <section aria-labelledby="shop-by-category">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="shop-by-category" className="font-display text-2xl md:text-3xl">
          Shop by category
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {tiles.map(({ category, count, image }) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setCategory(category);
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted text-left"
          >
            <ProductImage
              src={image}
              alt=""
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white md:p-5">
              <span>
                <span className="block text-lg font-semibold md:text-xl">{category}</span>
                <span className="block text-xs text-white/80">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
