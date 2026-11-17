"use client";

import { useEffect } from "react";
import { useStore } from "@/components/store-provider";

/** Empties the cart once the payment has been confirmed on the server. */
export function ClearCartOnMount() {
  const { clearCart, isLoaded } = useStore();

  useEffect(() => {
    if (isLoaded) clearCart();
  }, [isLoaded, clearCart]);

  return null;
}
