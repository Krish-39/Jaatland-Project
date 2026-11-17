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
import { logoutAction, type AuthUser } from "@/app/actions/auth";
import { LEGACY_LS_KEYS, LS_KEYS } from "@/lib/mock-data";
import { readArray, removeStored, writeJson } from "@/lib/storage";
import type { CartLine } from "@/lib/orders";
import type { HomepageConfig, Product } from "@/lib/types";

const LS = LS_KEYS;

interface Toast {
  id: number;
  message: string;
}

interface StoreContextValue {
  /** True once cart and wishlist have been read from browser storage. */
  isLoaded: boolean;
  /** No database in this deployment: accounts, admin and checkout are off. */
  showcase: boolean;

  /** Catalog and homepage copy, rendered on the server from the database. */
  products: Product[];
  homepageConfig: HomepageConfig;

  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  addToCart: (product: Product, size?: string) => void;
  updateQty: (id: string, delta: number, size?: string) => void;
  clearCart: () => void;

  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;

  /** Signed-in user as reported by the server session; null for guests. */
  user: AuthUser | null;
  /** Call after a successful login or registration server action. */
  setSignedIn: (user: AuthUser) => void;
  logout: () => Promise<void>;

  notify: (message: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

interface StoreProviderProps {
  products: Product[];
  homepageConfig: HomepageConfig;
  showcase?: boolean;
  children: React.ReactNode;
}

export function StoreProvider({
  products,
  homepageConfig,
  showcase = false,
  children,
}: StoreProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  // Cart and wishlist live in this browser. Read them once after mount.
  useEffect(() => {
    // Earlier builds kept accounts (with readable passwords), the admin flag
    // and catalog edits in localStorage. Remove those leftovers.
    LEGACY_LS_KEYS.forEach(removeStored);

    setCart(readArray<CartLine>(LS.CART));
    setWishlist(readArray<string>(LS.WISHLIST));
    setIsLoaded(true);
  }, []);

  // Ask the server who is signed in. The session lives in an httpOnly cookie
  // that scripts cannot read, so this is the only way the UI can know.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { user: AuthUser | null } | null) => {
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => {
        // Offline or server error: stay signed out in the UI.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) writeJson(LS.CART, cart);
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) writeJson(LS.WISHLIST, wishlist);
  }, [wishlist, isLoaded]);

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

  const setSignedIn = useCallback((next: AuthUser) => setUser(next), []);

  const logout = useCallback(async () => {
    try {
      await logoutAction();
      setUser(null);
    } catch {
      notify("Could not sign out. Please try again.");
    }
  }, [notify]);

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
      showcase,
      products,
      homepageConfig,
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
      setSignedIn,
      logout,
      notify,
    }),
    [
      isLoaded,
      showcase,
      products,
      homepageConfig,
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
      setSignedIn,
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
