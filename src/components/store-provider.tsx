"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_PRODUCTS,
  LS_KEYS,
} from "@/lib/mock-data";
import { readArray, readJson, removeStored, writeJson } from "@/lib/storage";
import type { CartLine } from "@/lib/orders";
import type { HomepageConfig, Product } from "@/lib/types";

const LS = LS_KEYS;

interface Toast {
  id: number;
  message: string;
}

interface StoreContextValue {
  isLoaded: boolean;

  products: Product[];
  saveProducts: (products: Product[]) => void;
  homepageConfig: HomepageConfig;
  saveHomepageConfig: (config: HomepageConfig) => void;

  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  addToCart: (product: Product, size?: string) => void;
  updateQty: (id: string, delta: number, size?: string) => void;
  clearCart: () => void;

  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;

  user: { email: string } | null;
  login: (user: { email: string }) => void;
  logout: () => void;

  notify: (message: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [homepageConfig, setHomepageConfig] =
    useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  // Hydrate once on the client. Defaults are rendered on the server.
  useEffect(() => {
    const storedProducts = readJson<Product[] | null>(LS.PRODUCTS, null);
    if (Array.isArray(storedProducts)) setProducts(storedProducts);

    const storedHomepage = readJson<Partial<HomepageConfig> | null>(LS.HOMEPAGE, null);
    if (storedHomepage) {
      setHomepageConfig((prev) => ({
        ...prev,
        ...storedHomepage,
        homepageProducts: storedHomepage.homepageProducts || prev.homepageProducts,
      }));
    }

    setCart(readArray<CartLine>(LS.CART));
    setWishlist(readArray<string>(LS.WISHLIST));

    const storedUser = readJson<{ email?: string } | null>(LS.USER, null);
    if (storedUser?.email) setUser({ email: storedUser.email });

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) writeJson(LS.CART, cart);
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) writeJson(LS.WISHLIST, wishlist);
  }, [wishlist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      writeJson(LS.USER, user);
    } else {
      removeStored(LS.USER);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const saveProducts = useCallback(
    (next: Product[]) => {
      setProducts(next);
      if (!writeJson(LS.PRODUCTS, next)) {
        notify("Could not save products — browser storage is full or disabled.");
      }
    },
    [notify]
  );

  const saveHomepageConfig = useCallback(
    (next: HomepageConfig) => {
      setHomepageConfig(next);
      if (!writeJson(LS.HOMEPAGE, next)) {
        notify("Could not save homepage settings — browser storage is full or disabled.");
      }
    },
    [notify]
  );

  const addToCart = useCallback(
    (product: Product, size?: string) => {
      const chosenSize = size ?? product.size?.[0];
      setCart((prev) => {
        const found = prev.find(
          (item) => item.id === product.id && item.size === chosenSize
        );
        if (found) {
          return prev.map((item) =>
            item.id === product.id && item.size === chosenSize
              ? { ...item, qty: item.qty + 1 }
              : item
          );
        }
        return [...prev, { id: product.id, size: chosenSize, qty: 1 }];
      });
      notify(`${product.name} added to cart`);
    },
    [notify]
  );

  const updateQty = useCallback((id: string, delta: number, size?: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (id: string) => {
      const removing = wishlist.includes(id);
      setWishlist((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
      notify(removing ? "Removed from wishlist" : "Saved to wishlist");
    },
    [wishlist, notify]
  );

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  const login = useCallback((next: { email: string }) => {
    setUser({ email: next.email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeStored(LS.USER_EMAIL);
    removeStored(LS.USER_PASSWORD);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.id);
        return sum + (product?.price ?? 0) * item.qty;
      }, 0),
    [cart, products]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      isLoaded,
      products,
      saveProducts,
      homepageConfig,
      saveHomepageConfig,
      cart,
      cartCount,
      subtotal,
      addToCart,
      updateQty,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      user,
      login,
      logout,
      notify,
    }),
    [
      isLoaded,
      products,
      saveProducts,
      homepageConfig,
      saveHomepageConfig,
      cart,
      cartCount,
      subtotal,
      addToCart,
      updateQty,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      user,
      login,
      logout,
      notify,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
        <div
          key={toast?.id}
          role="status"
          aria-live="polite"
          className={`pointer-events-auto rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 dark:bg-white dark:text-slate-900 ${
            toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          {toast?.message ?? ""}
        </div>
      </div>
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside <StoreProvider>");
  }
  return context;
}
