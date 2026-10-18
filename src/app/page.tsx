"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductGrid } from "@/components/product-card";
import {
  ShoppingCart,
  Moon,
  Sun,
  Search,
  Filter,
  Shirt,
  Truck,
  ShieldCheck,
  Sparkles,
  Instagram,
  Facebook,
  X as XIcon,
  Heart,
  SortDesc,
  User,
  LogOut,
  Package,
  Menu,
} from "lucide-react";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_HOMEPAGE_CONFIG,
  CATEGORIES,
  SIZES,
  COLORS,
  LS_KEYS,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from "@/lib/mock-data";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { HomepageConfig, Product } from "@/lib/types";

// Products will be loaded from localStorage on client side

// LocalStorage helpers
const LS = LS_KEYS;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "priceAsc", label: "Price: Low → High" },
  { value: "priceDesc", label: "Price: High → Low" },
  { value: "nameAsc", label: "Name: A → Z" },
] as const;

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
      <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">{label}</Label>
      <div className={gridClass}>
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(o)}
              onCheckedChange={(v) =>
                onChange(v ? [...selected, o] : selected.filter((x) => x !== o))
              }
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Jaatland() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [cart, setCart] = useState<{ id: string; size?: string; qty: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [sort, setSort] = useState<"featured" | "priceAsc" | "priceDesc" | "nameAsc">("featured");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [loginError, setLoginError] = useState("");
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [homepageConfig, setHomepageConfig] =
    useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);

  // Load products and homepage config from localStorage on client side
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

    const storedHomepage = localStorage.getItem(LS.HOMEPAGE);
    if (storedHomepage) {
      try {
        setHomepageConfig(JSON.parse(storedHomepage));
      } catch (e) {
        console.error("Error parsing homepage config:", e);
      }
    }
  }, []);

  const minPrice = useMemo(() => Math.floor(Math.min(...products.map((p) => p.price))), [products]);
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map((p) => p.price))), [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  // Load persisted state
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LS.CART);
      const savedWL = localStorage.getItem(LS.WISHLIST);
      const savedTheme = localStorage.getItem(LS.THEME);
      const savedPrice = localStorage.getItem(LS.PRICE);
      const savedSort = localStorage.getItem(LS.SORT);
      const savedUser = localStorage.getItem(LS.USER);

      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Error parsing cart:", e);
        }
      }
      if (savedWL) {
        try {
          setWishlist(JSON.parse(savedWL));
        } catch (e) {
          console.error("Error parsing wishlist:", e);
        }
      }
      if (savedTheme) setDark(savedTheme === "dark");
      if (savedPrice) {
        const parsed = JSON.parse(savedPrice);
        if (Array.isArray(parsed) && parsed.length === 2) setPriceRange([+parsed[0], +parsed[1]]);
      }
      if (savedSort === "priceAsc" || savedSort === "priceDesc" || savedSort === "nameAsc") setSort(savedSort);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing user:", e);
        }
      }
      setIsLoaded(true);
    } catch {}
  }, []);

  // Persist state
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

  useEffect(() => {
    if (!isLoaded) return;
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(LS.THEME, dark ? "dark" : "light");
    } catch {}
  }, [dark, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LS.PRICE, JSON.stringify(priceRange));
    } catch {}
  }, [priceRange, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LS.SORT, sort);
    } catch {}
  }, [sort, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LS.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Error saving user:", e);
    }
  }, [user, isLoaded]);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (category) list = list.filter((p) => p.category === category);
    if (sizeFilters.length) list = list.filter((p) => p.size.some((s) => sizeFilters.includes(s)));
    if (colorFilters.length) list = list.filter((p) => colorFilters.includes(p.color));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

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
  }, [products, query, category, sizeFilters, colorFilters, priceRange, sort]);

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

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (products.find((p) => p.id === item.id)?.price || 0) * item.qty, 0),
    [cart, products]
  );

  const addToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const defaultSize = product.size && product.size.length > 0 ? product.size[0] : undefined;

    setCart((prev) => {
      const found = prev.find((i) => i.id === id && (!i.size || i.size === defaultSize));
      if (found) {
        return prev.map((i) =>
          i.id === id && (!i.size || i.size === defaultSize) ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { id, size: defaultSize, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number, size?: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id && (!size || i.size === size) ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const wishlistProducts = useMemo(() => products.filter((p) => wishlist.includes(p.id)), [wishlist, products]);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginForm.email || !loginForm.password) {
      setLoginError("Please enter email and password");
      return;
    }

    if (isCreateAccount) {
      if (loginForm.password !== loginForm.confirmPassword) {
        setLoginError("Passwords do not match");
        return;
      }

      const existingEmail = localStorage.getItem(LS.USER_EMAIL);
      if (existingEmail === loginForm.email) {
        setLoginError("Account already exists. Please login instead.");
        return;
      }

      localStorage.setItem(LS.USER_EMAIL, loginForm.email);
      localStorage.setItem(LS.USER_PASSWORD, loginForm.password);
      setUser({ email: loginForm.email });
      setShowLogin(false);
      setLoginForm({ email: "", password: "", confirmPassword: "" });
      setIsCreateAccount(false);
    } else {
      if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASSWORD) {
        localStorage.setItem(LS.ADMIN_EMAIL, loginForm.email);
        router.push("/admin");
        return;
      }

      const storedEmail = localStorage.getItem(LS.USER_EMAIL);
      const storedPassword = localStorage.getItem(LS.USER_PASSWORD);

      if (storedEmail === loginForm.email && storedPassword === loginForm.password) {
        setUser({ email: loginForm.email });
        setShowLogin(false);
        setLoginForm({ email: "", password: "", confirmPassword: "" });
      } else {
        setLoginError("Invalid email or password");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(LS.USER);
    localStorage.removeItem(LS.USER_EMAIL);
    localStorage.removeItem(LS.USER_PASSWORD);
  };

  const featuredProducts = useMemo(() => {
    const hp = homepageConfig.homepageProducts;
    const hasFeaturedProducts =
      hp.Men?.length > 0 ||
      hp.Women?.length > 0 ||
      hp.Unisex?.length > 0 ||
      hp.Accessories?.length > 0;

    if (hasFeaturedProducts) {
      return products.filter(
        (p) =>
          hp.Men?.includes(p.id) ||
          hp.Women?.includes(p.id) ||
          hp.Unisex?.includes(p.id) ||
          hp.Accessories?.includes(p.id)
      );
    }

    // Show a mix of products from different categories
    const allFeatured: Product[] = [];
    (CATEGORIES as readonly string[]).forEach((cat) => {
      const catProducts = products.filter((p) => p.category === cat).slice(0, 3);
      allFeatured.push(...catProducts);
    });
    return allFeatured;
  }, [products, homepageConfig]);

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCategory(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Shirt className="h-6 w-6" />
              </button>
              <button
                onClick={() => {
                  setCategory(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span className="font-extrabold tracking-tight text-xl">JAATLAND</span>
              </button>
              <Badge className="ml-1" variant="secondary">
                Clothing Co.
              </Badge>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory((prev) => (prev === c ? null : c))}
                  className={`text-sm hover:underline ${category === c ? "font-semibold" : ""}`}
                >
                  {c}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 opacity-60" />
                  <Input
                    className="pl-8 w-56"
                    placeholder="Search products"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 relative">
                      <Filter className="h-4 w-4" /> Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 justify-center p-0 text-xs">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-3">
                    <div className="space-y-3">
                      <FilterCheckboxGroup
                        label="Sizes"
                        options={SIZES}
                        selected={sizeFilters}
                        onChange={setSizeFilters}
                        gridClass="grid grid-cols-6 gap-2"
                      />

                      <Separator />

                      <FilterCheckboxGroup
                        label="Colors"
                        options={COLORS}
                        selected={colorFilters}
                        onChange={setColorFilters}
                        gridClass="grid grid-cols-3 gap-2"
                      />

                      <Separator />

                      <div>
                        <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">
                          Price Range
                        </Label>
                        <div className="px-2">
                          <Slider
                            min={minPrice}
                            max={maxPrice}
                            step={1}
                            value={[priceRange[0], priceRange[1]]}
                            onValueChange={(vals) => {
                              const [lo, hi] = vals as number[];
                              setPriceRange([lo, hi]);
                            }}
                          />
                          <div className="mt-2 flex items-center justify-between text-xs opacity-80">
                            <span>{formatCurrency(priceRange[0])}</span>
                            <span>{formatCurrency(priceRange[1])}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSizeFilters([]);
                            setColorFilters([]);
                            setPriceRange([minPrice, maxPrice]);
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
                        onClick={() => setSort(value)}
                        className={sort === value ? "font-semibold" : ""}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="Open wishlist">
                    <Heart className={`h-5 w-5 ${wishlist.length ? "fill-current" : ""}`} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[420px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Your Wishlist</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {wishlistProducts.length === 0 && (
                      <p className="text-sm opacity-70">
                        No favorites yet. Tap the ♥ on products to add them.
                      </p>
                    )}
                    {wishlistProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl border p-3">
                        <Image
                          src={getImageUrl(p)}
                          alt={p.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm opacity-70">{formatCurrency(p.price)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleWishlist(p.id)}>
                            Remove
                          </Button>
                          <Button size="sm" onClick={() => addToCart(p.id)}>
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
                  <Button size="icon" variant="outline" aria-label="Open cart" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cart.reduce((sum, item) => sum + item.qty, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[420px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Your Cart</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {cart.length === 0 && (
                      <p className="text-sm opacity-70">Your cart is empty. Add some Jaatland drip ✨</p>
                    )}
                    {cart.map((item) => {
                      const p = products.find((x) => x.id === item.id);
                      if (!p) return null;
                      return (
                        <div key={`${item.id}-${item.size || "default"}`} className="flex items-center gap-3 rounded-xl border p-3">
                          <Image
                            src={getImageUrl(p)}
                            alt={p.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-sm opacity-70">
                              {formatCurrency(p.price)} each
                              {item.size && <span className="ml-2">• Size: {item.size}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => updateQty(item.id, -1, item.size)}>
                              -
                            </Button>
                            <span className="w-6 text-center">{item.qty}</span>
                            <Button size="icon" onClick={() => updateQty(item.id, 1, item.size)}>
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-70">Subtotal</span>
                    <span className="text-lg font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <Button className="mt-4 w-full" disabled={cart.length === 0} onClick={() => router.push("/checkout")}>
                    Checkout
                  </Button>
                </SheetContent>
              </Sheet>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">{user.email}</div>
                    <DropdownMenuItem onClick={() => router.push("/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      Your Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog open={showLogin} onOpenChange={setShowLogin}>
                  <DialogTrigger asChild>
                    <Button variant="ghost">Login</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{isCreateAccount ? "Create Account" : "User Login"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUserLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="user-email">Email</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-password">Password</Label>
                        <Input
                          id="user-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      {isCreateAccount && (
                        <div>
                          <Label htmlFor="user-confirm-password">Confirm Password</Label>
                          <Input
                            id="user-confirm-password"
                            type="password"
                            value={loginForm.confirmPassword || ""}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                      )}
                      {loginError && <div className="text-red-600 text-sm text-center">{loginError}</div>}
                      <Button type="submit" className="w-full">
                        {isCreateAccount ? "Create Account" : "Login"}
                      </Button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setIsCreateAccount(!isCreateAccount)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {isCreateAccount
                            ? "Already have an account? Login"
                            : "Don't have an account? Create one"}
                        </button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[320px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 opacity-60" />
                <Input
                  className="pl-8"
                  placeholder="Search products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">
                  Categories
                </Label>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCategory((prev) => (prev === c ? null : c));
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
                        category === c ? "font-semibold" : ""
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <FilterCheckboxGroup
                  label="Sizes"
                  options={SIZES}
                  selected={sizeFilters}
                  onChange={setSizeFilters}
                  gridClass="grid grid-cols-3 gap-2"
                />
              </div>

              <div>
                <FilterCheckboxGroup
                  label="Colors"
                  options={COLORS}
                  selected={colorFilters}
                  onChange={setColorFilters}
                  gridClass="grid grid-cols-2 gap-2"
                />
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">Sort</Label>
                <div className="flex flex-col gap-1">
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSort(value)}
                      className={`rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
                        sort === value ? "font-semibold" : ""
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={clearFilters}>
                Clear all filters
              </Button>

              <Separator />

              <div className="flex flex-col gap-1">
                {user ? (
                  <>
                    <div className="px-2 text-sm font-medium">{user.email}</div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/orders");
                      }}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Package className="h-4 w-4" /> My Orders
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <button
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

        {/* Hero */}
        {!hasActiveFilters && (
          <section className="relative">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-2 md:py-16">
              <div className="flex flex-col justify-center">
                <Badge className="w-fit" variant="secondary">
                  <Sparkles className="mr-2 h-4 w-4" /> New Drop
                </Badge>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                  {homepageConfig.heroTitle}
                </h1>
                <p className="mt-3 max-w-prose text-base opacity-80">{homepageConfig.heroSubtitle}</p>
                <div className="mt-6 flex items-center gap-6 text-sm opacity-80">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Free EU shipping €40+
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> 30-day returns
                  </div>
                </div>
              </div>
              <div className="relative h-72 overflow-hidden rounded-3xl shadow-2xl md:h-[420px]">
                {homepageConfig.heroImage && (
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    src={homepageConfig.heroImage}
                    alt="Jaatland Hero"
                    priority
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/20" />
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 pb-24">
          {hasActiveFilters ? (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-bold">Search results</h2>
                  <p className="mt-1 text-sm opacity-70">
                    {filtered.length} {filtered.length === 1 ? "item" : "items"}
                    {category && ` in ${category}`}
                  </p>
                </div>
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <XIcon className="h-4 w-4" /> Clear all
                </Button>
              </div>
              <ProductGrid
                products={filtered}
                cart={cart}
                wishlist={wishlist}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                emptyMessage="No products match your filters. Try clearing some criteria."
              />
            </>
          ) : (
            <>
          {/* Featured Products */}
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Featured Products</h2>
                <div className="flex items-center gap-3 text-sm opacity-70">
                  <span>{products.length} items</span>
                </div>
              </div>
              <ProductGrid
                products={featuredProducts}
                cart={cart}
                wishlist={wishlist}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
              />
            </>

          {/* Category Sections */}
          {CATEGORIES.map((cat) => {
            const categoryProducts = products.filter((p) => p.category === cat);

            return (
              <div key={cat}>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold">{cat === "Accessories" ? "Accessories" : `${cat}'s Collection`}</h2>
                  <p className="text-sm opacity-70 mt-1">
                    {cat === "Men" && "Premium wear for the modern man"}
                    {cat === "Women" && "Stylish pieces for every occasion"}
                    {cat === "Unisex" && "Styles for everyone"}
                    {cat === "Accessories" && "Complete your look"}
                  </p>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm opacity-70">{categoryProducts.length} items</span>
                </div>
                <ProductGrid
                  products={categoryProducts}
                  cart={cart}
                  wishlist={wishlist}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                />
              </div>
            );
          })}

          {/* Newsletter */}
            <div className="mt-16 rounded-3xl border p-6 md:p-10">
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold">{homepageConfig.newsletterTitle}</h3>
                  <p className="mt-1 text-sm opacity-80">{homepageConfig.newsletterSubtitle}</p>
                </div>
                {newsletterDone ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    You&apos;re on the list. Welcome to the club!
                  </div>
                ) : (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newsletterEmail.trim()) return;
                      try {
                        localStorage.setItem("jaatland_newsletter_email", newsletterEmail.trim());
                      } catch {}
                      setNewsletterDone(true);
                      setNewsletterEmail("");
                    }}
                  >
                    <Input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <Button type="submit">Subscribe</Button>
                  </form>
                )}
              </div>
            </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t py-10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                <span className="font-extrabold">JAATLAND</span>
              </div>
              <p className="mt-2 text-sm opacity-70">
                Made with ❤️ in Europe. Sustainable fabrics, fair wages, and small-batch production.
              </p>
            </div>
            <div className="text-sm">
              <div className="font-semibold">Shop</div>
              <ul className="mt-2 space-y-1 opacity-80">
                <li>
                  <button onClick={() => setCategory("Men")}>Men</button>
                </li>
                <li>
                  <button onClick={() => setCategory("Women")}>Women</button>
                </li>
                <li>
                  <button onClick={() => setCategory("Unisex")}>Unisex</button>
                </li>
                <li>
                  <button onClick={() => setCategory("Accessories")}>Accessories</button>
                </li>
              </ul>
              <div className="font-semibold mt-4">Account</div>
              <ul className="mt-2 space-y-1 opacity-80">
                <li>
                  <button onClick={() => router.push("/orders")}>My Orders</button>
                </li>
                {user && (
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                )}
              </ul>
            </div>
            <div className="text-sm">
              <div className="font-semibold">Follow</div>
              <div className="mt-2 flex items-center gap-3 opacity-80">
                <a href="#" aria-label="Instagram" className="hover:opacity-100">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" aria-label="X" className="hover:opacity-100">
                  <XIcon className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Facebook" className="hover:opacity-100">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-7xl px-4 text-xs opacity-60">
            © {new Date().getFullYear()} Jaatland Clothing Co. All rights reserved.
          </div>
        </footer>
    </div>
  );
}

