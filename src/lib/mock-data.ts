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
    name: 'Classic Tee',
    price: 24.99,
    category: 'Unisex',
    color: 'White',
    size: ['S', 'M', 'L', 'XL'],
    images: ['/products/classic-tee-1.jpg', '/products/classic-tee-2.jpg'],
    badge: 'Bestseller',
    similarIds: ['p2', 'p3', 'p4'],
  },
  {
    id: 'p2',
    name: 'Heritage Oversized Tee',
    price: 29.99,
    category: 'Men',
    color: 'Olive',
    size: ['M', 'L', 'XL'],
    images: ['/products/heritage-oversized-tee-1.jpg'],
    badge: 'New',
    similarIds: ['p1', 'p4', 'p5'],
  },
  {
    id: 'p3',
    name: 'Nazaare Crop Top',
    price: 22.5,
    category: 'Women',
    color: 'Black',
    size: ['XS', 'S', 'M'],
    images: ['/products/nazaare-crop-top-1.jpg'],
    badge: undefined,
    similarIds: ['p1', 'p4'],
  },
  {
    id: 'p4',
    name: 'Desi Flex Hoodie',
    price: 49.99,
    category: 'Unisex',
    color: 'Gray',
    size: ['M', 'L', 'XL', 'XXL'],
    images: ['/products/desi-flex-hoodie-1.jpg'],
    badge: 'Limited',
    similarIds: ['p1', 'p2', 'p3', 'p5'],
  },
  {
    id: 'p5',
    name: 'Roadrunner Joggers',
    price: 39.99,
    category: 'Men',
    color: 'Black',
    size: ['S', 'M', 'L'],
    images: ['/products/roadrunner-joggers-1.jpg'],
    badge: undefined,
    similarIds: ['p2', 'p4'],
  },
  {
    id: 'p6',
    name: 'Nakhre Tote',
    price: 18.99,
    category: 'Accessories',
    color: 'Beige',
    size: ['One'],
    images: ['/products/nakhre-tote-1.jpg'],
    badge: undefined,
    similarIds: [],
  },
];

// Default homepage copy/layout (admin edits save an override to localStorage).
// Keep the copy to claims the store can back up: no sustainability, origin or
// "worldwide shipping" promises unless they are demonstrably true.
export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: 'Jaatland — Land of Premium Wear.',
  heroSubtitle:
    'Everyday basics and statement pieces built for comfort. Tees, hoodies, joggers and accessories in limited drops.',
  heroImage: '/products/hero.jpg',
  newsletterTitle: 'Join the Jaatland club',
  newsletterSubtitle:
    'Get early access to drops and news from Jaatland.',
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
  /** Email used at the last guest checkout, so guests can see their orders. */
  BUYER_EMAIL: 'jaatland_buyer_email',
  ORDERS: 'jaatland_orders',
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
  'jaatland_products',
  'jaatland_products_v2',
  'jaatland_homepage',
  'jaatland_homepage_v2',
] as const;
