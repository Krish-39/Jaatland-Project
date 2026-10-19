import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Pin the locale: with `undefined` the server (en-US) and the browser (e.g.
  // de-DE) can format the same price differently, which shows up as a
  // hydration mismatch and inconsistent copy. en-IE keeps the €24.99 form.
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getImageUrl(product: { images?: string[] | null }): string {
  return product.images?.find((img) => !!img) || '';
}

export function generateId(prefix: string = 'p'): string {
  return `${prefix}${Date.now()}`;
}
