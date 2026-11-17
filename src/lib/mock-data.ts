// Shared mock data for Jaatland E-commerce Project
// This eliminates duplication across multiple page files

import { HomepageConfig, Product } from '@/lib/types';

export const CATEGORIES = ['Men', 'Women', 'Unisex', 'Accessories'] as const;
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const COLORS = ['Black', 'White', 'Gray', 'Blue', 'Beige', 'Olive', 'Red', 'Maroon'] as const;

// Product photos are local files under public/products. They come from
// Unsplash under the Unsplash License (free for commercial use); sources are
// listed in public/products/CREDITS.md. Never hotlink third-party shop images.
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Essential Crew-Neck T-Shirt',
    price: 24.99,
    category: 'Unisex',
    color: 'White',
    size: ['S', 'M', 'L', 'XL'],
    images: ['/products/crew-neck-t-shirt-1.jpg', '/products/crew-neck-t-shirt-2.jpg'],
    badge: 'Core Range',
    similarIds: ['p2', 'p3', 'p4'],
  },
  {
    id: 'p2',
    name: 'Relaxed-Fit T-Shirt',
    price: 29.99,
    category: 'Men',
    color: 'Olive',
    size: ['M', 'L', 'XL'],
    images: ['/products/relaxed-fit-t-shirt-1.jpg'],
    badge: 'New Arrival',
    similarIds: ['p1', 'p4', 'p5'],
  },
  {
    id: 'p3',
    name: 'Cropped Short-Sleeve Top',
    price: 22.5,
    category: 'Women',
    color: 'Black',
    size: ['XS', 'S', 'M'],
    images: ['/products/cropped-top-1.jpg'],
    badge: undefined,
    similarIds: ['p1', 'p4'],
  },
  {
    id: 'p4',
    name: 'Pullover Hoodie',
    price: 49.99,
    category: 'Unisex',
    color: 'Gray',
    size: ['M', 'L', 'XL', 'XXL'],
    images: ['/products/pullover-hoodie-1.jpg'],
    badge: 'Limited Edition',
    similarIds: ['p1', 'p2', 'p3', 'p5'],
  },
  {
    id: 'p5',
    name: 'Tapered Cargo Joggers',
    price: 39.99,
    category: 'Men',
    color: 'Black',
    size: ['S', 'M', 'L'],
    images: ['/products/cargo-joggers-1.jpg'],
    badge: undefined,
    similarIds: ['p2', 'p4'],
  },
  {
    id: 'p6',
    name: 'Everyday Tote Bag',
    price: 18.99,
    category: 'Accessories',
    color: 'Beige',
    size: ['One'],
    images: ['/products/tote-bag-1.jpg'],
    badge: undefined,
    similarIds: [],
  },
];

// Default homepage copy/layout (admin edits save an override to localStorage).
// Keep the copy to claims the store can back up: no sustainability, origin or
// "worldwide shipping" promises unless they are demonstrably true.
export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: 'Considered essentials for everyday wear.',
  heroSubtitle:
    'T-shirts, hoodies, joggers and accessories, designed for comfort and a clean, modern fit.',
  heroImage: '/products/hero.jpg',
  newsletterTitle: 'Subscribe to our newsletter',
  newsletterSubtitle:
    'Be the first to hear about new collections and news from Jaatland.',
  homepageProducts: {
    Men: [],
    Women: [],
    Unisex: [],
    Accessories: [],
  },
};

// LocalStorage keys. Only per-browser convenience state lives here; the
// catalog, accounts and sessions are stored on the server.
export const LS_KEYS = {
  CART: 'jaatland_cart',
  WISHLIST: 'jaatland_wishlist',
  THEME: 'jaatland_theme',
  PRICE: 'jaatland_price',
  SORT: 'jaatland_sort',
  /** Email used at the last checkout, to prefill the form next time. */
  BUYER_EMAIL: 'jaatland_buyer_email',
  /** `{ id, token }` for each order placed as a guest in this browser. The
   * token is what lets a guest view that order again. */
  GUEST_ORDERS: 'jaatland_guest_orders',
  NEWSLETTER: 'jaatland_newsletter_email',
} as const;

// Keys written by earlier builds that must no longer exist in a visitor's
// browser: local accounts with readable passwords, the client-side admin
// flag, and catalog overrides. The store deletes them on load.
export const LEGACY_LS_KEYS = [
  'jaatland_user',
  'jaatland_user_email',
  'jaatland_user_password',
  'jaatland_admin_email',
  'jaatland_orders',
  'jaatland_products',
  'jaatland_products_v2',
  'jaatland_homepage',
  'jaatland_homepage_v2',
] as const;
