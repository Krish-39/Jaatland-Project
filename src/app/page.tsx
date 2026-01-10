
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider"; // NEW: price range filter
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

// ---- Mock Data ----
const CATEGORIES = ["Men", "Women", "Unisex", "Accessories"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const COLORS = ["Black", "White", "Blue", "Beige", "Olive", "Maroon"] as const;

type Product = {
  id: string;
  name: string;
  price: number;
  category: (typeof CATEGORIES)[number];
  color: (typeof COLORS)[number] | string;
  size: string[];
  images: string[];
  badge?: string;
  similarIds: string[];
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Tee", price: 24.99, category: "Unisex", color: "Black", size: ["S","M","L","XL"], images: ["https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTfW-12ilFXxrNUFgFzxmHLnLjnmeWuDmhdPxTGG9G_6GwDOPCNdaSzG4h9FkKPM_Ekldf1I6q3zFbbVKhkFLjSc3wQ1ebxZ3fToBi0Y8kS&usqp=CAc"], badge: "Bestseller", similarIds: ["p2", "p3", "p4"] },
  { id: "p2", name: "Heritage Oversized Tee", price: 29.99, category: "Men", color: "Beige", size: ["M","L","XL"], images: ["https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSxARunzvXbWUt6ol8yZKNA9M4GhWTSQaSkRjDiO2mLt_4qPOOHQ8x7UqivF156RTw6M-AUwG-vI-uIx9517tHttN6--7Q6b1s04r1FFJNJ&usqp=CAc"], badge: "New", similarIds: ["p1", "p4", "p5"] },
  { id: "p3", name: "Nazaare Crop Top", price: 22.5, category: "Women", color: "White", size: ["XS","S","M"], images: ["https://media.istockphoto.com/id/1457860785/photo/white-crop-top-mockup-with-round-neckline-3d-rendering-female-t-shirt-with-label-isolated-on.jpg?s=612x612&w=0&k=20&c=pUEaMzO-a5Bjj6C6vqFbOIuizGX3erl2DCRu0G1qfD0="], similarIds: ["p1", "p4"] },
  { id: "p4", name: "Desi Flex Hoodie", price: 49.99, category: "Unisex", color: "gray", size: ["M","L","XL","XXL"], images: ["https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRqqKoZObhcYE7PfqYHRRxABdzHXFN0zhQFvI4192x78fdWiQAEiAwzeghw4sDb_B62gL5XID28ckrllWoK56eNts4C8pcqFP1lucABwz1RHA&usqp=CAc"], badge: "Limited", similarIds: ["p1", "p2", "p3", "p5"] },
  { id: "p5", name: "Roadrunner Joggers", price: 39.99, category: "Men", color: "Blue", size: ["S","M","L"], images: ["https://img01.ztat.net/article/spp-media-p1/80183efd8a0f4a7b9fc916f267bf1c7a/390e343cfbc941329b40d38a36df0064.jpg?imwidth=1800&filter=packshot"], similarIds: ["p2", "p4"] },
  { id: "p6", name: "Nakhre Tote", price: 18.99, category: "Accessories", color: "red", size: ["One"], images: ["https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQrzb1u88c6Ub2FhyQqA-k-UW2wMLW4l7WXkvGgj4PZigE-XWy4lmMtP2EKvmTExp37TKbt1aWI_B95o6itrs3xe52VuTP0wvnGgwbdJnrbS3VF&usqp=CAc"], similarIds: [] },
];

// Products will be loaded from localStorage on client side

// Helper to get image URL
const getImageUrl = (product: Product) => product.images?.[0] || "";

function currency(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);
}

// ---- LocalStorage helpers (NEW) ----
const LS = {
  CART: "jaatland_cart",
  WISHLIST: "jaatland_wishlist",
  THEME: "jaatland_theme",
  PRICE: "jaatland_price",
  SORT: "jaatland_sort",
};

// ---- Main App ----
export default function Jaatland() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]); // NEW
  const [sort, setSort] = useState<"featured" | "priceAsc" | "priceDesc" | "nameAsc">("featured"); // NEW
  const [user, setUser] = useState<{email: string} | null>(null); // NEW: user auth
  const [showAuth, setShowAuth] = useState(false); // NEW: auth modal
  const [authMode, setAuthMode] = useState<"login" | "signup">("login"); // NEW
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [loginError, setLoginError] = useState("");
  const [isCreateAccount, setIsCreateAccount] = useState(false);

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [homepageConfig, setHomepageConfig] = useState({
    heroTitle: "Jaatland-Land of Premium Wear.",
    heroSubtitle: "Premium basics and statement pieces engineered for comfort, quality, and everyday flex. Ethically made. Limited batches. Ships World wide.",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
    newsletterTitle: "Join the Jaatland club",
    newsletterSubtitle: "Get early access to drops, exclusive discounts, and behind‑the‑scenes stories.",
    homepageProducts: {
      Men: [] as string[],
      Women: [] as string[],
      Unisex: [] as string[],
      Accessories: [] as string[],
    },
  });

  // Load products and homepage config from localStorage on client side
  useEffect(() => {
    const stored = localStorage.getItem("jaatland_products");
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

    const storedHomepage = localStorage.getItem("jaatland_homepage");
    if (storedHomepage) {
      try {
        setHomepageConfig(JSON.parse(storedHomepage));
      } catch (e) {
        console.error("Error parsing homepage config:", e);
      }
    }
  }, []);

  const minPrice = useMemo(() => Math.floor(Math.min(...products.map((p: Product) => p.price))), []);
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map((p: Product) => p.price))), []);
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]); // NEW

  // ---- Load persisted state (NEW) ----
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LS.CART);
      const savedWL = localStorage.getItem(LS.WISHLIST);
      const savedTheme = localStorage.getItem(LS.THEME);
      const savedPrice = localStorage.getItem(LS.PRICE);
      const savedSort = localStorage.getItem(LS.SORT);
      const savedUser = localStorage.getItem("jaatland_user");
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
    } catch {}
  }, []);

  // ---- Persist state (NEW) ----
  useEffect(() => {
    try {
      localStorage.setItem(LS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart:", e);
    }
  }, [cart]);
  useEffect(() => {
    try {
      localStorage.setItem(LS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Error saving wishlist:", e);
    }
  }, [wishlist]);
  useEffect(() => {
    try { localStorage.setItem(LS.THEME, dark ? "dark" : "light"); } catch {}
  }, [dark]);
  useEffect(() => {
    try { localStorage.setItem(LS.PRICE, JSON.stringify(priceRange)); } catch {}
  }, [priceRange]);
  useEffect(() => {
    try { localStorage.setItem(LS.SORT, sort); } catch {}
  }, [sort]);
  useEffect(() => {
    try {
      localStorage.setItem("jaatland_user", JSON.stringify(user));
    } catch (e) {
      console.error("Error saving user:", e);
    }
  }, [user]);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p: Product) => p.name.toLowerCase().includes(q));
    }
    if (category) list = list.filter((p: Product) => p.category === category);
    if (sizeFilters.length) list = list.filter((p: Product) => p.size.some((s: string) => sizeFilters.includes(s)));
    if (colorFilters.length) list = list.filter((p: Product) => colorFilters.includes(p.color));
    // NEW: price range
    list = list.filter((p: Product) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    // NEW: sorting
    switch (sort) {
      case "priceAsc":
        list.sort((a: Product, b: Product) => a.price - b.price);
        break;
      case "priceDesc":
        list.sort((a: Product, b: Product) => b.price - a.price);
        break;
      case "nameAsc":
        list.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
        break;
      default:
        // featured: keep original order
        break;
    }
    return list;
  }, [products, query, category, sizeFilters, colorFilters, priceRange, sort]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (products.find((p: Product) => p.id === item.id)?.price || 0) * item.qty, 0),
    [cart, products]
  );

  const addToCart = (id: string) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  // NEW: wishlist helpers
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const wishlistProducts = useMemo(() => products.filter((p: Product) => wishlist.includes(p.id)), [wishlist, products]);

  // NEW: auth helpers
  const handleAuth = (email: string, password: string, isSignup: boolean) => {
    if (isSignup) {
      // Store user credentials
      localStorage.setItem("jaatland_user_email", email);
      localStorage.setItem("jaatland_user_password", password);
      setUser({ email });
      localStorage.setItem("jaatland_user", JSON.stringify({ email }));
    } else {
      // Check credentials
      const storedEmail = localStorage.getItem("jaatland_user_email");
      const storedPassword = localStorage.getItem("jaatland_user_password");
      if (storedEmail === email && storedPassword === password) {
        setUser({ email });
        localStorage.setItem("jaatland_user", JSON.stringify({ email }));
      } else {
        throw new Error("Invalid email or password");
      }
    }
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("jaatland_user");
    localStorage.removeItem("jaatland_user_email");
    localStorage.removeItem("jaatland_user_password");
  };

  // NEW: User login handler
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginForm.email || !loginForm.password) {
      setLoginError("Please enter email and password");
      return;
    }

    if (isCreateAccount) {
      // Create account mode
      if (loginForm.password !== loginForm.confirmPassword) {
        setLoginError("Passwords do not match");
        return;
      }

      // Check if user already exists
      const existingEmail = localStorage.getItem("jaatland_user_email");
      if (existingEmail === loginForm.email) {
        setLoginError("Account already exists. Please login instead.");
        return;
      }

      // Create new account
      localStorage.setItem("jaatland_user_email", loginForm.email);
      localStorage.setItem("jaatland_user_password", loginForm.password);
      setUser({ email: loginForm.email });
      setShowLogin(false);
      setLoginForm({ email: "", password: "", confirmPassword: "" });
      setIsCreateAccount(false);
    } else {
      // Login mode
      // Check if admin credentials
      if (loginForm.email === "krishahir@jaatland.com" && loginForm.password === "1234") {
        localStorage.setItem("jaatland_admin_email", loginForm.email);
        window.location.href = "/admin";
        return;
      }

      // Check regular user credentials
      const storedEmail = localStorage.getItem("jaatland_user_email");
      const storedPassword = localStorage.getItem("jaatland_user_password");

      if (storedEmail === loginForm.email && storedPassword === loginForm.password) {
        setUser({ email: loginForm.email });
        setShowLogin(false);
        setLoginForm({ email: "", password: "", confirmPassword: "" });
      } else {
        setLoginError("Invalid email or password");
      }
    }
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => { setCategory(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <Shirt className="h-6 w-6" />
              </button>
              <button onClick={() => { setCategory(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span className="font-extrabold tracking-tight text-xl">JAATLAND</span>
              </button>
              <Badge className="ml-1" variant="secondary">Clothing Co.</Badge>
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

                {/* NEW: Filters dropdown with price slider */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-3">
                    <div className="space-y-3">
                      <div>
                        <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">Sizes</Label>
                        <div className="grid grid-cols-6 gap-2">
                          {SIZES.map((s) => (
                            <label key={s} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={sizeFilters.includes(s)}
                                onCheckedChange={(v) =>
                                  setSizeFilters((prev) =>
                                    v ? [...prev, s] : prev.filter((x) => x !== s)
                                  )
                                }
                              />
                              {s}
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">Colors</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {COLORS.map((c) => (
                            <label key={c} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={colorFilters.includes(c)}
                                onCheckedChange={(v) =>
                                  setColorFilters((prev) =>
                                    v ? [...prev, c] : prev.filter((x) => x !== c)
                                  )
                                }
                              />
                              {c}
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* NEW: Price Range */}
                      <div>
                        <Label className="mb-2 block text-xs uppercase tracking-wide opacity-70">Price Range</Label>
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
                            <span>{currency(priceRange[0])}</span>
                            <span>{currency(priceRange[1])}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSizeFilters([]); setColorFilters([]); setPriceRange([minPrice, maxPrice]);
                          }}
                        >Reset</Button>
                        <Button onClick={() => { /* menu closes automatically */ }}>Apply</Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* NEW: Sort menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2"><SortDesc className="h-4 w-4" /> Sort</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => setSort("featured")} className={sort === "featured" ? "font-semibold" : ""}>Featured</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("priceAsc")} className={sort === "priceAsc" ? "font-semibold" : ""}>Price: Low → High</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("priceDesc")} className={sort === "priceDesc" ? "font-semibold" : ""}>Price: High → Low</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("nameAsc")} className={sort === "nameAsc" ? "font-semibold" : ""}>Name: A → Z</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* NEW: Wishlist Sheet */}
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
                      <p className="text-sm opacity-70">No favorites yet. Tap the ♥ on products to add them.</p>
                    )}
                    {wishlistProducts.map((p: Product) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl border p-3">
                        <img src={getImageUrl(p)} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm opacity-70">{currency(p.price)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleWishlist(p.id)}>Remove</Button>
                          <Button size="sm" onClick={() => addToCart(p.id)}>Add to cart</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Cart Sheet */}
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
                      const p = products.find((x: Product) => x.id === item.id)!;
                      return (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3">
                          <img src={getImageUrl(p)} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-sm opacity-70">{currency(p.price)} each</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => updateQty(item.id, -1)}>-</Button>
                            <span className="w-6 text-center">{item.qty}</span>
                            <Button size="icon" onClick={() => updateQty(item.id, 1)}>+</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-70">Subtotal</span>
                    <span className="text-lg font-semibold">{currency(total)}</span>
                  </div>
                  <Button className="mt-4 w-full" disabled={cart.length === 0} onClick={() => router.push('/checkout')}>Checkout</Button>
                </SheetContent>
              </Sheet>

              {/* NEW: User auth button beside cart */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">{user.email}</div>
                    <DropdownMenuItem onClick={() => router.push('/orders')}>
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
                    <Button variant="ghost">
                      Login
                    </Button>
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
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
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
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
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
                            onChange={(e) => setLoginForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                      )}
                      {loginError && (
                        <div className="text-red-600 text-sm text-center">{loginError}</div>
                      )}
                      <Button type="submit" className="w-full">
                        {isCreateAccount ? "Create Account" : "Login"}
                      </Button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setIsCreateAccount(!isCreateAccount)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {isCreateAccount ? "Already have an account? Login" : "Don't have an account? Create one"}
                        </button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        {!category && (
          <section className="relative">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-2 md:py-16">
              <div className="flex flex-col justify-center">
                <Badge className="w-fit" variant="secondary"><Sparkles className="mr-2 h-4 w-4" /> New Drop</Badge>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                  {homepageConfig.heroTitle}
                </h1>
                <p className="mt-3 max-w-prose text-base opacity-80">
                  {homepageConfig.heroSubtitle}
                </p>
                <div className="mt-6 flex items-center gap-6 text-sm opacity-80">
                  <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free EU shipping €40+</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 30-day returns</div>
                </div>
              </div>
              <div className="relative h-72 overflow-hidden rounded-3xl shadow-2xl md:h-[420px]">
                {homepageConfig.heroImage && (
                  <img
                    className="h-full w-full object-cover"
                    src={homepageConfig.heroImage}
                    alt="Jaatland Hero"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/20" />
              </div>
            </div>
          </section>
        )}

        {/* Product Grid */}
        <main className="mx-auto max-w-7xl px-4 pb-24">
          {/* Featured Products Section */}
          {!category && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Featured Products</h2>
                <div className="flex items-center gap-3 text-sm opacity-70">
                  <span>{filtered.length} items</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Show featured products - mix of products from different categories */}
                {(() => {
                  const hp = homepageConfig.homepageProducts || { Men: [], Women: [], Unisex: [], Accessories: [] };
                  const hasFeaturedProducts = hp.Men?.length > 0 || hp.Women?.length > 0 || hp.Unisex?.length > 0 || hp.Accessories?.length > 0;
                  
                  if (hasFeaturedProducts) {
                    return products.filter((p: Product) => 
                      (hp.Men?.includes(p.id) ||
                      hp.Women?.includes(p.id) ||
                      hp.Unisex?.includes(p.id) ||
                      hp.Accessories?.includes(p.id))
                    ).map((p: Product) => (
                      <Link key={p.id} href={`/product/${p.id}`}>
                        <Card className="overflow-hidden cursor-pointer">
                          <CardHeader className="p-0">
                            <div className="relative h-56">
                              <img src={getImageUrl(p)} alt={p.name} className="h-full w-full object-cover" />
                              <div className="absolute left-3 top-3 flex flex-col gap-1">
                                {p.badge && (
                                  <Badge variant="secondary">{p.badge}</Badge>
                                )}
                                {(() => {
                                  const cartItem = cart.find((item) => item.id === p.id);
                                  return cartItem ? (
                                    <Badge variant="default">In Cart ({cartItem.qty})</Badge>
                                  ) : null;
                                })()}
                              </div>
                              <button
                                aria-label="Toggle wishlist"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleWishlist(p.id);
                                }}
                                className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white ${wishlist.includes(p.id) ? "text-red-600" : "text-slate-700"}`}
                              >
                                <Heart className={`h-5 w-5 ${wishlist.includes(p.id) ? "fill-current" : ""}`} />
                              </button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-1 p-4">
                            <CardTitle className="text-base">{p.name}</CardTitle>
                            <div className="text-sm opacity-70">{p.category} • {p.color}</div>
                            <div className="text-lg font-semibold">{currency(p.price)}</div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between p-4">
                            <div className="text-xs opacity-70">Sizes: {p.size.join(", ")}</div>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                addToCart(p.id);
                              }}
                              size="sm"
                            >
                              Add to cart
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ));
                  }
                  
                  // Show a mix of products from different categories
                  const categoryNames = ["Men", "Women", "Unisex", "Accessories"] as const;
                  const allFeatured: Product[] = [];
                  categoryNames.forEach(cat => {
                    const catProducts = products.filter(p => p.category === cat).slice(0, 3);
                    allFeatured.push(...catProducts);
                  });
                  return allFeatured.map((p: Product) => (
                    <Link key={p.id} href={`/product/${p.id}`}>
                      <Card className="overflow-hidden cursor-pointer">
                        <CardHeader className="p-0">
                          <div className="relative h-56">
                            <img src={getImageUrl(p)} alt={p.name} className="h-full w-full object-cover" />
                            <div className="absolute left-3 top-3 flex flex-col gap-1">
                              {p.badge && (
                                <Badge variant="secondary">{p.badge}</Badge>
                              )}
                              {(() => {
                                const cartItem = cart.find((item) => item.id === p.id);
                                return cartItem ? (
                                  <Badge variant="default">In Cart ({cartItem.qty})</Badge>
                                ) : null;
                              })()}
                            </div>
                            <button
                              aria-label="Toggle wishlist"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleWishlist(p.id);
                              }}
                              className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white ${wishlist.includes(p.id) ? "text-red-600" : "text-slate-700"}`}
                            >
                              <Heart className={`h-5 w-5 ${wishlist.includes(p.id) ? "fill-current" : ""}`} />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-1 p-4">
                          <CardTitle className="text-base">{p.name}</CardTitle>
                          <div className="text-sm opacity-70">{p.category} • {p.color}</div>
                          <div className="text-lg font-semibold">{currency(p.price)}</div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between p-4">
                          <div className="text-xs opacity-70">Sizes: {p.size.join(", ")}</div>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(p.id);
                            }}
                            size="sm"
                          >
                            Add to cart
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ));
                })()}
              </div>
            </>
          )}

          {/* Men's Collection */}
          {category === "Men" && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold">Men's Collection</h2>
                <p className="text-sm opacity-70 mt-1">Premium wear for the modern man</p>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm opacity-70">{products.filter((p: Product) => p.category === "Men").length} items</span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter((p: Product) => p.category === "Men").map((p: Product) => (
                  <Link key={p.id} href={`/product/${p.id}`}>
                    <Card className="overflow-hidden cursor-pointer">
                      <CardHeader className="p-0">
                        <div className="relative h-56">
                          <img src={getImageUrl(p)} alt={p.name} className="h-full w-full object-cover" />
                          <div className="absolute left-3 top-3 flex flex-col gap-1">
                            {p.badge && (
                              <Badge variant="secondary">{p.badge}</Badge>
                            )}
                            {(() => {
                              const cartItem = cart.find((item) => item.id === p.id);
                              return cartItem ? (
                                <Badge variant="default">In Cart ({cartItem.qty})</Badge>
                              ) : null;
                            })()}
                          </div>
                          <button
                            aria-label="Toggle wishlist"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(p.id);
                            }}
                            className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white ${wishlist.includes(p.id) ? "text-red-600" : "text-slate-700"}`}
                          >
                            <Heart className={`h-5 w-5 ${wishlist.includes(p.id) ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1 p-4">
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        <div className="text-sm opacity-70">{p.category} • {p.color}</div>
                        <div className="text-lg font-semibold">{currency(p.price)}</div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between p-4">
                        <div className="text-xs opacity-70">Sizes: {p.size.join(", ")}</div>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(p.id);
                          }}
                          size="sm"
                        >
                          Add to cart
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Women's Collection */}
          {category === "Women" && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold">Women's Collection</h2>
                <p className="text-sm opacity-70 mt-1">Stylish pieces for every occasion</p>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm opacity-70">{products.filter((p: Product) => p.category === "Women").length} items</span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter((p: Product) => p.category === "Women").map((p: Product) => (
                  <Link key={p.id} href={`/product/${p.id}`}>
                    <Card className="overflow-hidden cursor-pointer">
                      <CardHeader className="p-0">
                        <div className="relative h-56">
                          <img src={getImageUrl(p)} alt={p.name} className="h-full w-full object-cover" />
                          <div className="absolute left-3 top-3 flex flex-col gap-1">
                            {p.badge && (
                              <Badge variant="secondary">{p.badge}</Badge>
                            )}
                            {(() => {
                              const cartItem = cart.find((item) => item.id === p.id);
                              return cartItem ? (
                                <Badge variant="default">In Cart ({cartItem.qty})</Badge>
                              ) : null;
                            })()}
                          </div>
                          <button
                            aria-label="Toggle wishlist"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(p.id);
                            }}
                            className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white ${wishlist.includes(p.id) ? "text-red-600" : "text-slate-700"}`}
                          >
                            <Heart className={`h-5 w-5 ${wishlist.includes(p.id) ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1 p-4">
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        <div className="text-sm opacity-70">{p.category} • {p.color}</div>
                        <div className="text-lg font-semibold">{currency(p.price)}</div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between p-4">
                        <div className="text-xs opacity-70">Sizes: {p.size.join(", ")}</div>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(p.id);
                          }}
                          size="sm"
                        >
                          Add to cart
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Unisex Collection */}
          {category === "Unisex" && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold">Unisex Collection</h2>
                <p className="text-sm opacity-70 mt-1">Styles for everyone</p>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm opacity-70">{products.filter((p: Product) => p.category === "Unisex").length} items</span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter((p: Product) => p.category === "Unisex").map((p: Product) => (
                  <Link key={p.id} href={`/product/${p.id}`}>
                    <Card className="overflow-hidden cursor-pointer">
                      <CardHeader className="p-0">
                        <div className="relative h-56">
                          <img src={getImageUrl(p)} alt={p.name} className="h-full w-full object-cover" />
                          <div className="absolute left-3 top-3 flex flex-col gap-1">
                            {p.badge && (
                              <Badge variant="secondary">{p.badge}</Badge>
                            )}
                            {(() => {
                              const cartItem = cart.find((item) => item.id === p.id);
                              return cartItem ? (
                                <Badge variant="default">In Cart ({cartItem.qty})</Badge>
                              ) : null;
                            })()}
                          </div>
                          <button
                            aria-label="Toggle wishlist"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(p.id);
                            }}
                            className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white ${wishlist.includes(p.id) ? "text-red-600" : "text-slate-700"}`}
                          >
                            <Heart className={`h-5 w-5 ${wishlist.includes(p.id) ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1 p-4">
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        <div className="text-sm opacity-70">{p.category} • {p.color}</div>
                        <div className="text-lg font-semibold">{currency(p.price)}</div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between p-4">
                        <div className="text-xs opacity-70">Sizes: {p.size.join(", ")}</div>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(p.id);
                          }}
                          size="sm"
                        >
                          Add to cart
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Accessories Collection */}
          {category === "Accessories" && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold">Accessories</h2>
                <p className="text-sm opacity-70 mt-1">Complete your look</p>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm opacity-70">{products.filter((p: Product) => p.category === "Accessories").length} items</span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter((p: Product) => p.category === "Accessories").map((p: Product) => (
                  <Link key={p.id} href={`/product/${p.id}`}>
                    <Card className="overflow-hidden cursor-pointer">
                      <CardHeader className="p-0">
                        <div className="relative h-56">
                          <img src={getImageUrl(p)} alt={p.name} className="h-full w-full object-cover" />
                          <div className="absolute left-3 top-3 flex flex-col gap-1">
                            {p.badge && (
                              <Badge variant="secondary">{p.badge}</Badge>
                            )}
                            {(() => {
                              const cartItem = cart.find((item) => item.id === p.id);
                              return cartItem ? (
                                <Badge variant="default">In Cart ({cartItem.qty})</Badge>
                              ) : null;
                            })()}
                          </div>
                          <button
                            aria-label="Toggle wishlist"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(p.id);
                            }}
                            className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white ${wishlist.includes(p.id) ? "text-red-600" : "text-slate-700"}`}
                          >
                            <Heart className={`h-5 w-5 ${wishlist.includes(p.id) ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1 p-4">
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        <div className="text-sm opacity-70">{p.category} • {p.color}</div>
                        <div className="text-lg font-semibold">{currency(p.price)}</div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between p-4">
                        <div className="text-xs opacity-70">Sizes: {p.size.join(", ")}</div>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(p.id);
                          }}
                          size="sm"
                        >
                          Add to cart
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Newsletter */}
          {!category && (
            <div className="mt-16 rounded-3xl border p-6 md:p-10">
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold">{homepageConfig.newsletterTitle}</h3>
                  <p className="mt-1 text-sm opacity-80">{homepageConfig.newsletterSubtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="you@example.com" />
                  <Button>Subscribe</Button>
                </div>
              </div>
            </div>
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
              <p className="mt-2 text-sm opacity-70">Made with ❤️ in Europe. Sustainable fabrics, fair wages, and small-batch production.</p>
            </div>
              <div className="text-sm">
                <div className="font-semibold">Shop</div>
                <ul className="mt-2 space-y-1 opacity-80">
                  <li><button onClick={() => setCategory("Men")}>Men</button></li>
                  <li><button onClick={() => setCategory("Women")}>Women</button></li>
                  <li><button onClick={() => setCategory("Unisex")}>Unisex</button></li>
                  <li><button onClick={() => setCategory("Accessories")}>Accessories</button></li>
                </ul>
                <div className="font-semibold mt-4">Account</div>
                <ul className="mt-2 space-y-1 opacity-80">
                  <li><button onClick={() => router.push('/orders')}>My Orders</button></li>
                  {user && <li><button onClick={handleLogout}>Logout</button></li>}
                </ul>
              </div>
            <div className="text-sm">
              <div className="font-semibold">Follow</div>
              <div className="mt-2 flex items-center gap-3 opacity-80">
                <a href="#" aria-label="Instagram" className="hover:opacity-100"><Instagram className="h-5 w-5" /></a>
                <a href="#" aria-label="X" className="hover:opacity-100"><XIcon className="h-5 w-5" /></a>
                <a href="#" aria-label="Facebook" className="hover:opacity-100"><Facebook className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-7xl px-4 text-xs opacity-60">© {new Date().getFullYear()} Jaatland Clothing Co. All rights reserved.</div>
        </footer>

        {/* NEW: Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {authMode === "login" ? "Login" : "Sign Up"}
                </h2>
                <button
                  onClick={() => setShowAuth(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <AuthForm
                mode={authMode}
                onSubmit={handleAuth}
                onSwitchMode={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// NEW: Auth Form Component
function AuthForm({
  mode,
  onSubmit,
  onSwitchMode,
}: {
  mode: "login" | "signup";
  onSubmit: (email: string, password: string, isSignup: boolean) => void;
  onSwitchMode: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      onSubmit(email, password, mode === "signup");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="auth-password">Password</Label>
        <Input
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
      </div>

      {mode === "signup" && (
        <div>
          <Label htmlFor="auth-confirm">Confirm Password</Label>
          <Input
            id="auth-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
          />
        </div>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button type="submit" className="w-full">
        {mode === "login" ? "Login" : "Sign Up"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-sm text-blue-600 hover:underline"
        >
          {mode === "login" ? "Need to create an account?" : "Already have an account?"}
        </button>
      </div>
    </form>
  );
}
