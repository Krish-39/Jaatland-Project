// Single source of truth for shipping prices. The cart, the checkout, the
// order builder and the "Shipping & Payment" page all read from here so the
// price a customer is shown is always the price they are charged.

export const FREE_SHIPPING_THRESHOLD = 40;
export const SHIPPING_FLAT_RATE = 4.9;

/** Shipping cost in EUR for a given items subtotal. Empty carts ship nothing. */
export function shippingCostFor(subtotal: number): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
}

/** Items subtotal plus shipping, rounded to whole cents. */
export function orderTotalFor(subtotal: number): number {
  return Math.round((subtotal + shippingCostFor(subtotal)) * 100) / 100;
}
