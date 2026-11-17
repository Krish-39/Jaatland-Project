"use client";

import React, { createContext, useContext } from "react";
import { useStore } from "@/components/store-provider";
import { useProductFilters, type ProductFilters } from "@/hooks/use-product-filters";

// Search, filter and sort state shared by the header (on every page) and the
// product listing on the homepage. Lives in the root layout so it survives
// navigation: searching from a product page shows the results on the
// homepage without losing what was typed.
const FiltersContext = createContext<ProductFilters | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const { products, isLoaded } = useStore();
  const filters = useProductFilters(products, isLoaded);
  return <FiltersContext.Provider value={filters}>{children}</FiltersContext.Provider>;
}

export function useFilters(): ProductFilters {
  const context = useContext(FiltersContext);
  if (!context) throw new Error("useFilters must be used inside <FiltersProvider>");
  return context;
}
