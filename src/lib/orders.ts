import type { Order, OrderItem, OrderShipping, Product } from "@/lib/types";

export interface CartLine {
  id: string;
  size?: string;
  qty: number;
}

export interface CreateOrderInput {
  cart: CartLine[];
  products: Product[];
  email: string;
  shipping: Omit<OrderShipping, "email">;
  /** Injectable clock/id source so the order builder stays pure and testable. */
  now?: number;
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

export function createOrder({
  cart,
  products,
  email,
  shipping,
  now = Date.now(),
}: CreateOrderInput): Order {
  const items = toOrderItems(cart, products);

  return {
    id: `ORD-${now}`,
    date: new Date(now).toISOString(),
    email,
    items,
    total: calculateItemsTotal(items),
    status: "pending",
    shipping: { ...shipping, email },
  };
}

/** Case-insensitive buyer match, supporting legacy orders that only stored
 * the address email instead of the top-level email. */
export function orderBelongsTo(order: Order, email?: string | null): boolean {
  if (!email) return false;

  const target = email.trim().toLowerCase();
  if (!target) return false;

  return [order.email, order.shipping?.email].some(
    (candidate) => candidate?.trim().toLowerCase() === target
  );
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
