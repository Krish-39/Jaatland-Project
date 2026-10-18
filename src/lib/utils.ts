import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getImageUrl(product: { images?: string[] | null }): string {
  return product.images?.[0] || '';
}

export function generateId(prefix: string = 'p'): string {
  return `${prefix}${Date.now()}`;
}
