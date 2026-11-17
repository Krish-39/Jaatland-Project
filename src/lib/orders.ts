import type { Order, OrderItem, Product } from "@/lib/types";

export interface CartLine {
  id: string;
  size?: string;
  qty: number;
}

export function calculateItemsTotal(
  items: Pick<OrderItem, "price" | "qty">[]
): number {
  const total = items.reduce((sum, item) => {
    const price = Number.isFinite(item.price) ? (item.price as number) : 0;
    return sum + price * item.qty;
  }, 0);

  return Math.round(total * 100) / 100;
}

/**
 * Snapshots name/price/image onto each line. Orders must not change when the
 * catalog is edited later (or when a product is deleted), so the order is the
 * source of truth for what the customer bought and at what price.
 */
export function toOrderItems(cart: CartLine[], products: Product[]): OrderItem[] {
  return cart.flatMap((line) => {
    const product = products.find((p) => p.id === line.id);
    if (!product) return [];

    return [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        size: line.size,
        qty: line.qty,
        image: product.images?.find((image) => !!image) ?? "",
      },
    ];
  });
}

/** Resolves a line item for display, falling back to the live catalog only for
 * legacy orders saved before items were snapshotted. */
export function resolveOrderItem(
  item: OrderItem,
  products: Product[]
): { name: string; image: string; unitPrice: number } {
  const product = products.find((p) => p.id === item.id);

  return {
    name: item.name || product?.name || "Product",
    image: item.image || product?.images?.find((image) => !!image) || "",
    unitPrice:
      typeof item.price === "number" && Number.isFinite(item.price)
        ? item.price
        : product?.price ?? 0,
  };
}

/** Subtotal / shipping / total for display. Orders saved before shipping was
 * recorded only have `total`, which was the items total with free shipping. */
export function orderAmounts(order: Pick<Order, "subtotal" | "shippingCost" | "total">): {
  subtotal: number;
  shippingCost: number;
  total: number;
} {
  const shippingCost =
    typeof order.shippingCost === "number" && Number.isFinite(order.shippingCost)
      ? order.shippingCost
      : 0;
  const subtotal =
    typeof order.subtotal === "number" && Number.isFinite(order.subtotal)
      ? order.subtotal
      : Math.round((order.total - shippingCost) * 100) / 100;

  return { subtotal, shippingCost, total: order.total };
}
