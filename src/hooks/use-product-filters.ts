"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LS_KEYS } from "@/lib/mock-data";
import { readJson, readString, writeJson, writeString } from "@/lib/storage";
import type { Product } from "@/lib/types";

export type SortOption = "featured" | "priceAsc" | "priceDesc" | "nameAsc";

const SORT_OPTIONS = ["featured", "priceAsc", "priceDesc", "nameAsc"] as const;

function isSortOption(value: string | null): value is SortOption {
  return !!value && (SORT_OPTIONS as readonly string[]).includes(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toRange(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const lo = Number(value[0]);
  const hi = Number(value[1]);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  return [Math.min(lo, hi), Math.max(lo, hi)];
}

/**
 * Reads the persisted price range. Newer saves are `{ range, bounds }` so we
 * can tell a narrowed range from one that merely matched the old catalog.
 * Older saves are a bare `[lo, hi]` (we expand those to the full range, since
 * most of them are the old full-catalog range itself).
 */
function readSavedPriceRange(
  saved: unknown,
  bounds: [number, number]
): [number, number] {
  const [minPrice, maxPrice] = bounds;

  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    const record = saved as { range?: unknown; bounds?: unknown };
    const range = toRange(record.range);
    const savedBounds = toRange(record.bounds);

    if (range && savedBounds && range[0] === savedBounds[0] && range[1] === savedBounds[1]) {
      return [minPrice, maxPrice];
    }
    if (range) {
      return [
        clamp(range[0], minPrice, maxPrice),
        clamp(range[1], minPrice, maxPrice),
      ];
    }
  }

  // Older saves are a bare `[lo, hi]` with no bounds recorded, so we can't
  // tell a full catalog range from a narrowed one. Default to the full range
  // (the common case for values written before bounds were tracked).
  return [minPrice, maxPrice];
}

/**
 * Search/filter/sort state for the storefront. Lives in one hook so the
 * header (search, filter menus, mobile sheet) and the product grid stay in
 * sync without prop-drilling a dozen setters.
 *
 * `catalogReady` tells the hook when the catalog has been hydrated from
 * localStorage. Until then we render a skeleton, so the price slider never
 * flashes the default catalog bounds.
 */
export function useProductFilters(products: Product[], catalogReady: boolean) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("featured");
  const [hydrated, setHydrated] = useState(false);

  const minPrice = useMemo(
    () =>
      products.length
        ? Math.floor(Math.min(...products.map((p) => p.price)))
        : 0,
    [products]
  );
  const maxPrice = useMemo(
    () =>
      products.length
        ? Math.ceil(Math.max(...products.map((p) => p.price)))
        : 0,
    [products]
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);

  // Hydrate persisted sort/price once the real catalog is available.
  const hydratedCatalogRef = useRef(false);
  useEffect(() => {
    if (!catalogReady || hydratedCatalogRef.current) return;
    hydratedCatalogRef.current = true;

    const savedSort = readString(LS_KEYS.SORT);
    if (isSortOption(savedSort)) setSort(savedSort);

    setPriceRange(readSavedPriceRange(readJson<unknown>(LS_KEYS.PRICE, null), [minPrice, maxPrice]));
    setHydrated(true);
  }, [catalogReady, minPrice, maxPrice]);

  useEffect(() => {
    if (hydrated) writeString(LS_KEYS.SORT, sort);
  }, [sort, hydrated]);

  useEffect(() => {
    if (hydrated) {
      // Store the bounds too: a range that still equals the bounds means the
      // user never narrowed it, so a later catalog change can expand it.
      writeJson(LS_KEYS.PRICE, {
        range: priceRange,
        bounds: [minPrice, maxPrice],
      });
    }
  }, [priceRange, hydrated, minPrice, maxPrice]);

  // Keep the price range in sync if the catalog changes while this view is
  // mounted (e.g. products edited in another tab). Untouched ranges follow the
  // new bounds; user-selected ranges are clamped into them.
  const boundsRef = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!catalogReady) return;
    const previous = boundsRef.current;
    boundsRef.current = [minPrice, maxPrice];

    // The hydration effect owns the very first range.
    if (!previous) return;

    setPriceRange(([lo, hi]) => {
      // A range that still matches the previous bounds was never narrowed by
      // the user — follow the catalog instead of keeping it stuck.
      if (previous && lo === previous[0] && hi === previous[1]) {
        return [minPrice, maxPrice];
      }

      const nextLo = clamp(lo, minPrice, maxPrice);
      const nextHi = clamp(hi, minPrice, maxPrice);
      return nextLo === lo && nextHi === hi ? [lo, hi] : [nextLo, nextHi];
    });
  }, [catalogReady, minPrice, maxPrice]);

  const filtered = useMemo(() => {
    let list = products.slice();

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (category) list = list.filter((p) => p.category === category);
    if (sizeFilters.length) {
      list = list.filter((p) => p.size.some((size) => sizeFilters.includes(size)));
    }
    if (colorFilters.length) {
      list = list.filter((p) => colorFilters.includes(p.color));
    }
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sort) {
      case "priceAsc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "nameAsc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return list;
  }, [
    products,
    query,
    category,
    sizeFilters,
    colorFilters,
    priceRange,
    sort,
  ]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== null ||
    sizeFilters.length > 0 ||
    colorFilters.length > 0 ||
    sort !== "featured" ||
    priceRange[0] !== minPrice ||
    priceRange[1] !== maxPrice;

  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    (category ? 1 : 0) +
    sizeFilters.length +
    colorFilters.length +
    (sort !== "featured" ? 1 : 0) +
    (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setCategory(null);
    setSizeFilters([]);
    setColorFilters([]);
    setPriceRange([minPrice, maxPrice]);
    setSort("featured");
  };

  return {
    query,
    setQuery,
    category,
    setCategory,
    sizeFilters,
    setSizeFilters,
    colorFilters,
    setColorFilters,
    sort,
    setSort,
    priceRange,
    setPriceRange,
    minPrice,
    maxPrice,
    filtered,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
  };
}

export type ProductFilters = ReturnType<typeof useProductFilters>;
