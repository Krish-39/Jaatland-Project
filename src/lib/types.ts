// Shared types for Jaatland E-commerce Project
// Constants and helpers live in "@/lib/mock-data" and "@/lib/utils".

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
  email?: string;
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
