// Shared types for Jaatland E-commerce Project

// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  color: string;
  size: ProductSize[];
  images: string[];
  badge?: string;
  similarIds: string[];
}

export type ProductCategory = 'Men' | 'Women' | 'Unisex' | 'Accessories';
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One';

// Cart types
export interface CartItem {
  id: string;
  size: string;
  qty: number;
}

// Wishlist types
export interface WishlistItem {
  id: string;
}

// User types
export interface User {
  email: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

// Order types
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered';

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingInfo: ShippingInfo;
}

export interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Homepage configuration types
export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  homepageProducts: {
    Men: string[];
    Women: string[];
    Unisex: string[];
    Accessories: string[];
  };
}

// Filter types
export interface FilterState {
  category: string | null;
  sizeFilters: string[];
  colorFilters: string[];
  priceRange: [number, number];
  sortBy: SortOption;
}

export type SortOption = 'featured' | 'priceAsc' | 'priceDesc' | 'nameAsc';

// LocalStorage keys
export const LS_KEYS = {
  CART: 'jaatland_cart',
  WISHLIST: 'jaatland_wishlist',
  THEME: 'jaatland_theme',
  PRICE: 'jaatland_price',
  SORT: 'jaatland_sort',
  USER: 'jaatland_user',
  ORDERS: 'jaatland_orders',
  PRODUCTS: 'jaatland_products',
  HOMEPAGE: 'jaatland_homepage',
} as const;

// Constants
export const CATEGORIES = ['Men', 'Women', 'Unisex', 'Accessories'] as const;
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const COLORS = ['Black', 'White', 'Blue', 'Beige', 'Olive', 'Maroon'] as const;

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getImageUrl(product: Product): string {
  return product.images?.[0] || '';
}

export function calculateTotal(cart: CartItem[], products: Product[]): number {
  return cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.qty;
  }, 0);
}

export function filterProducts(
  products: Product[],
  filters: Partial<FilterState>
): Product[] {
  let filtered = [...products];

  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.sizeFilters && filters.sizeFilters.length > 0) {
    filtered = filtered.filter((p) =>
      p.size.some((s) => filters.sizeFilters!.includes(s))
    );
  }

  if (filters.colorFilters && filters.colorFilters.length > 0) {
    filtered = filtered.filter((p) => filters.colorFilters!.includes(p.color));
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);
  }

  if (filters.sortBy) {
    filtered = sortProducts(filtered, filters.sortBy);
  }

  return filtered;
}

export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case 'priceAsc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'nameAsc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function generateId(prefix: string = 'p'): string {
  return `${prefix}${Date.now()}`;
}

