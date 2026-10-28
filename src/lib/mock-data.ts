// Shared mock data for Jaatland E-commerce Project
// This eliminates duplication across multiple page files

import { HomepageConfig, Product } from '@/lib/types';

export const CATEGORIES = ['Men', 'Women', 'Unisex', 'Accessories'] as const;
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const COLORS = ['Black', 'White', 'Gray', 'Blue', 'Beige', 'Olive', 'Red', 'Maroon'] as const;

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Classic Tee',
    price: 24.99,
    category: 'Unisex',
    color: 'Black',
    size: ['S', 'M', 'L', 'XL'],
    images: [
      'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTfW-12ilFXxrNUFgFzxmHLnLjnmeWuDmhdPxTGG9G_6GwDOPCNdaSzG4h9FkKPM_Ekldf1I6q3zFbbVKhkFLjSc3wQ1ebxZ3fToBi0Y8kS&usqp=CAc',
      'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcREvQkUlykGJPQ7KH-q8dKb9smGYGZh6aqKIfaVnFMGccRf9Frp_dYfXUhI2QZMCB4XRWnqq3EG&usqp=CAc',
    ],
    badge: 'Bestseller',
    similarIds: ['p2', 'p3', 'p4'],
  },
  {
    id: 'p2',
    name: 'Heritage Oversized Tee',
    price: 29.99,
    category: 'Men',
    color: 'Beige',
    size: ['M', 'L', 'XL'],
    images: [
      'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSxARunzvXbWUt6ol8yZKNA9M4GhWTSQaSkRjDiO2mLt_4qPOOHQ8x7UqivF156RTw6M-AUwG-vI-uIx9517tHttN6--7Q6b1s04r1FFJNJ&usqp=CAc',
      'https://img01.ztat.net/article/spp-media-p1/b8df543741694359a8cd0c80bb25fe94/223cf2dfbfad4cd08bdb0a153188281d.jpg?imwidth=762',
    ],
    badge: 'New',
    similarIds: ['p1', 'p4', 'p5'],
  },
  {
    id: 'p3',
    name: 'Nazaare Crop Top',
    price: 22.5,
    category: 'Women',
    color: 'White',
    size: ['XS', 'S', 'M'],
    images: [
      'https://media.istockphoto.com/id/1457860785/photo/white-crop-top-mockup-with-round-neckline-3d-rendering-female-t-shirt-with-label-isolated-on.jpg?s=612x612&w=0&k=20&c=pUEaMzO-a5Bjj6C6vqFbOIuizGX3erl2DCRu0G1qfD0=',
      'https://www.shutterstock.com/image-photo/white-crop-top-mockup-on-600nw-2261342159.jpg',
    ],
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
    images: [
      'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRqqKoZObhcYE7PfqYHRRxABdzHXFN0zhQFvI4192x78fdWiQAEiAwzeghw4sDb_B62gL5XID28ckrllWoK56eNts4C8pcqFP1lucABwz1RHA&usqp=CAc',
      'https://img01.ztat.net/article/spp-media-p1/734a1198c51b4c8281d69bf5ff58d716/caf79badaa4c461698f1f45d07ecc076.jpg?imwidth=1800',
    ],
    badge: 'Limited',
    similarIds: ['p1', 'p2', 'p3', 'p5'],
  },
  {
    id: 'p5',
    name: 'Roadrunner Joggers',
    price: 39.99,
    category: 'Men',
    color: 'Blue',
    size: ['S', 'M', 'L'],
    images: [
      'https://img01.ztat.net/article/spp-media-p1/80183efd8a0f4a7b9fc916f267bf1c7a/390e343cfbc941329b40d38a36df0064.jpg?imwidth=1800&filter=packshot',
      'https://img01.ztat.net/article/spp-media-p1/13b93c1ea1a4434b8aaf8cbd6dda0d0b/ccc85954d15d4fddb00b4a8b6c52a986.jpg?imwidth=1800',
    ],
    badge: undefined,
    similarIds: ['p2', 'p4'],
  },
  {
    id: 'p6',
    name: 'Nakhre Tote',
    price: 18.99,
    category: 'Accessories',
    color: 'Red',
    size: ['One'],
    images: [
      'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQrzb1u88c6Ub2FhyQqA-k-UW2wMLW4l7WXkvGgj4PZigE-XWy4lmMtP2EKvmTExp37TKbt1aWI_B95o6itrs3xe52VuTP0wvnGgwbdJnrbS3VF&usqp=CAc',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: undefined,
    similarIds: [],
  },
];

// Default homepage copy/layout (admin edits save an override to localStorage)
export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: 'Jaatland-Land of Premium Wear.',
  heroSubtitle:
    'Premium basics and statement pieces engineered for comfort, quality, and everyday flex. Ethically made. Limited batches. Ships worldwide.',
  heroImage:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
  newsletterTitle: 'Join the Jaatland club',
  newsletterSubtitle:
    'Get early access to drops, exclusive discounts, and behind‑the‑scenes stories.',
  homepageProducts: {
    Men: [],
    Women: [],
    Unisex: [],
    Accessories: [],
  },
};

// LocalStorage keys
export const LS_KEYS = {
  CART: 'jaatland_cart',
  WISHLIST: 'jaatland_wishlist',
  THEME: 'jaatland_theme',
  PRICE: 'jaatland_price',
  SORT: 'jaatland_sort',
  USER: 'jaatland_user',
  /** Email used at the last guest checkout, so guests can see their orders. */
  BUYER_EMAIL: 'jaatland_buyer_email',
  ORDERS: 'jaatland_orders',
  PRODUCTS: 'jaatland_products',
  HOMEPAGE: 'jaatland_homepage',
  NEWSLETTER: 'jaatland_newsletter_email',
  ADMIN_EMAIL: 'jaatland_admin_email',
  USER_EMAIL: 'jaatland_user_email',
  USER_PASSWORD: 'jaatland_user_password',
} as const;

// Admin credentials
export const ADMIN_EMAIL = 'krishahir@jaatland.com';
export const ADMIN_PASSWORD = '1234';

