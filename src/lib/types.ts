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

// Order types
//
// Items carry a snapshot of the name/price/image at purchase time. Name and
// price are optional because orders placed before snapshots existed only stored
// the product id and quantity.
export interface OrderItem {
  id: string;
  name?: string;
  price?: number;
  size?: string;
  qty: number;
  image?: string;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface OrderShipping {
  name: string;
  email?: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  email?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shipping: OrderShipping;
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
