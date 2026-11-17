"use client";

import { ArrowUpRight } from "lucide-react";
import { useFilters } from "@/components/filters-provider";
import { useStore } from "@/components/store-provider";
import { CATEGORIES } from "@/lib/mock-data";

const BLURB: Record<string, string> = {
  Men: "Everyday essentials for men",
  Women: "Everyday essentials for women",
  Unisex: "Designed to be worn by everyone",
  Accessories: "Bags and everyday accessories",
};

/** Four big tiles that jump straight into a category. */
export function CategoryTiles() {
  const { setCategory } = useFilters();
  const { products } = useStore();

  return (
    <section aria-labelledby="shop-by-category" className="scroll-mt-24">
      <h2 id="shop-by-category" className="font-display text-4xl md:text-5xl">
        Shop by category
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CATEGORIES.map((category, index) => {
          const count = products.filter((product) => product.category === category).length;
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setCategory(category);
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`lift group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl border-2 border-ink p-4 text-left transition-colors md:min-h-44 md:p-5 ${
                index % 2 === 0 ? "bg-background" : "bg-slate-100 dark:bg-slate-900"
              } hover:bg-brand hover:text-[#1a1815]`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="font-display text-[1.3rem] sm:text-3xl md:text-4xl">
                  {category}
                </span>
                <ArrowUpRight
                  className="hidden h-6 w-6 shrink-0 transition-transform sm:block duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="text-sm">
                {BLURB[category]}
                <span className="mt-1 block text-xs font-bold uppercase tracking-wider opacity-70">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
