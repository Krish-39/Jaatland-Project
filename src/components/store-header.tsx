"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  Moon,
  Sun,
  Search,
  Filter,
  Shirt,
  Heart,
  SortDesc,
  User,
  LogOut,
  Package,
  Menu,
  Truck,
  Trash2,
} from "lucide-react";
import { CATEGORIES, SIZES, COLORS } from "@/lib/mock-data";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { LoginDialog } from "@/components/login-dialog";
import { useStore } from "@/components/store-provider";
import type { ProductFilters, SortOption } from "@/hooks/use-product-filters";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "priceAsc", label: "Price: Low → High" },
  { value: "priceDesc", label: "Price: High → Low" },
  { value: "nameAsc", label: "Name: A → Z" },
];

const FREE_SHIPPING_THRESHOLD = 40;

function FilterCheckboxGroup({
  label,
  options,
  selected,
  onChange,
  gridClass,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  gridClass: string;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">
        {label}
      </Label>
      <div className={gridClass}>
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(option)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selected, option]
                    : selected.filter((value) => value !== option)
                )
              }
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

interface StoreHeaderProps {
  filters: ProductFilters;
  dark: boolean;
  onToggleDark: () => void;
}

export function StoreHeader({
  filters,
  dark,
  onToggleDark,
}: StoreHeaderProps) {
  const router = useRouter();
  const {
    products,
    cart,
    cartCount,
    subtotal,
    wishlist,
    addToCart,
    updateQty,
    toggleWishlist,
    user,
    logout,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const wishlistProducts = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)),
    [products, wishlist]
  );

  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  const goHome = () => {
    filters.setCategory(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (category: string) => {
    filters.setCategory((prev) => (prev === category ? null : category));
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Jaatland home"
              onClick={goHome}
              className="rounded-md p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Shirt className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goHome}
              className="rounded-md py-1 text-left"
            >
              <span className="whitespace-nowrap text-xl font-extrabold tracking-tight">
                JAATLAND
              </span>
            </button>
            <Badge
              className="ml-1 hidden shrink-0 sm:inline-flex"
              variant="secondary"
            >
              Clothing Co.
            </Badge>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                aria-pressed={filters.category === category}
                className={`relative text-sm font-medium transition-colors hover:text-slate-950 dark:hover:text-white ${
                  filters.category === category
                    ? "text-slate-950 after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-current dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden items-center gap-2 md:flex">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 opacity-60" />
                <Input
                  className="w-48 pl-8 lg:w-64"
                  placeholder="Search products"
                  aria-label="Search products"
                  value={filters.query}
                  onChange={(event) => filters.setQuery(event.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="relative gap-2">
                    <Filter className="h-4 w-4" /> Filters
                    {filters.activeFilterCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 justify-center p-0 text-xs"
                      >
                        {filters.activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-3">
                  <div className="space-y-3">
                    <FilterCheckboxGroup
                      label="Sizes"
                      options={SIZES}
                      selected={filters.sizeFilters}
                      onChange={filters.setSizeFilters}
                      gridClass="grid grid-cols-6 gap-2"
                    />

                    <Separator />

                    <FilterCheckboxGroup
                      label="Colors"
                      options={COLORS}
                      selected={filters.colorFilters}
                      onChange={filters.setColorFilters}
                      gridClass="grid grid-cols-3 gap-2"
                    />

                    <Separator />

                    <div>
                      <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">
                        Price Range
                      </Label>
                      <div className="px-2">
                        <Slider
                          min={filters.minPrice}
                          max={filters.maxPrice}
                          step={1}
                          value={[filters.priceRange[0], filters.priceRange[1]]}
                          onValueChange={(values) => {
                            const [lo, hi] = values as number[];
                            filters.setPriceRange([lo, hi]);
                          }}
                        />
                        <div className="mt-2 flex items-center justify-between text-xs opacity-80">
                          <span>{formatCurrency(filters.priceRange[0])}</span>
                          <span>{formatCurrency(filters.priceRange[1])}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          filters.setSizeFilters([]);
                          filters.setColorFilters([]);
                          filters.setPriceRange([
                            filters.minPrice,
                            filters.maxPrice,
                          ]);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SortDesc className="h-4 w-4" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => filters.setSort(value)}
                      className={
                        filters.sort === value ? "font-semibold" : undefined
                      }
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={`Open wishlist${
                    wishlist.length ? ` (${wishlist.length} items)` : ""
                  }`}
                  className="relative"
                >
                  <Heart
                    className={`h-5 w-5 ${wishlist.length ? "fill-current" : ""}`}
                  />
                  {wishlist.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 text-xs"
                    >
                      {wishlist.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                className="w-full overflow-y-auto sm:max-w-[480px]"
                description="Items you have saved for later"
              >
                <SheetHeader>
                  <SheetTitle>Your Wishlist</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {wishlistProducts.length === 0 && (
                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      No favourites yet. Tap the heart on any product to save it
                      for later.
                    </div>
                  )}
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <ProductImage
                        src={getImageUrl(product)}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">
                          {product.name}
                        </div>
                        <div className="text-sm opacity-70">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          Add to cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={`Open cart${cartCount ? ` (${cartCount} items)` : ""}`}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                className="flex w-full flex-col overflow-hidden sm:max-w-[480px]"
                description="Review the items in your cart before checkout"
              >
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
                  {cart.length === 0 && (
                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      Your cart is empty. Add some Jaatland drip ✨
                    </div>
                  )}
                  {cart.map((item) => {
                    const product = products.find(
                      (candidate) => candidate.id === item.id
                    );
                    if (!product) return null;
                    return (
                      <div
                        key={`${item.id}-${item.size || "default"}`}
                        className="flex items-center gap-3 rounded-xl border p-3"
                      >
                        <ProductImage
                          src={getImageUrl(product)}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {product.name}
                          </div>
                          <div className="text-sm opacity-70">
                            {formatCurrency(product.price)} each
                            {item.size && (
                              <span className="ml-2">• Size: {item.size}</span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQty(item.id, -1, item.size)
                              }
                              aria-label={`Decrease quantity of ${product.name}`}
                            >
                              −
                            </Button>
                            <span
                              className="w-6 text-center text-sm"
                              aria-label={`Quantity ${item.qty}`}
                            >
                              {item.qty}
                            </span>
                            <Button
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQty(item.id, 1, item.size)}
                              aria-label={`Increase quantity of ${product.name}`}
                            >
                              +
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="ml-1 h-7 w-7 text-slate-500"
                              onClick={() =>
                                updateQty(item.id, -item.qty, item.size)
                              }
                              aria-label={`Remove ${product.name} from cart`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {cart.length > 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900">
                    <div className="flex items-center gap-2 font-medium">
                      <Truck className="h-4 w-4" />
                      {shippingRemaining > 0
                        ? `Add ${formatCurrency(shippingRemaining)} for free shipping`
                        : "You've unlocked free shipping"}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-[width] duration-300 dark:bg-white"
                        style={{ width: `${shippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <Button
                  className="mt-4 w-full"
                  disabled={cart.length === 0}
                  onClick={() => router.push("/checkout")}
                >
                  Checkout
                </Button>
              </SheetContent>
            </Sheet>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                  </div>
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    <Package className="mr-2 h-4 w-4" />
                    Your Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="hidden md:inline-flex"
                onClick={() => setShowLogin(true)}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[320px] overflow-y-auto sm:max-w-[360px]"
          description="Browse categories, filters, and your account"
        >
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 opacity-60" />
              <Input
                className="pl-8"
                placeholder="Search products"
                aria-label="Search products"
                value={filters.query}
                onChange={(event) => filters.setQuery(event.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">
                Categories
              </Label>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className={`rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
                      filters.category === category ? "font-semibold" : ""
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <FilterCheckboxGroup
              label="Sizes"
              options={SIZES}
              selected={filters.sizeFilters}
              onChange={filters.setSizeFilters}
              gridClass="grid grid-cols-3 gap-2"
            />

            <FilterCheckboxGroup
              label="Colors"
              options={COLORS}
              selected={filters.colorFilters}
              onChange={filters.setColorFilters}
              gridClass="grid grid-cols-2 gap-2"
            />

            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">
                Sort
              </Label>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => filters.setSort(value)}
                    className={`rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
                      filters.sort === value ? "font-semibold" : ""
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={filters.clearFilters}
            >
              Clear all filters
            </Button>

            <Separator />

            <div className="flex flex-col gap-1">
              {user ? (
                <>
                  <div className="px-2 text-sm font-medium">{user.email}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push("/orders");
                    }}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Package className="h-4 w-4" /> My Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogin(true);
                  }}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <User className="h-4 w-4" /> Login
                </button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
