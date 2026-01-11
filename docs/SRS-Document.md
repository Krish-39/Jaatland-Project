# Software Requirements Specification (SRS)

## Jaatland E-Commerce Web Application

**Document Version:** 1.0  
**Date:** January 11, 2026  
**Project Name:** Jaatland - Premium Clothing E-Commerce Platform  
**Repository:** Krish-39/Jaatland-Project

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions and Acronyms](#13-definitions-and-acronyms)
   - 1.4 [References](#14-references)
   - 1.5 [Overview](#15-overview)
2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [Product Functions](#22-product-functions)
   - 2.3 [User Classes and Characteristics](#23-user-classes-and-characteristics)
   - 2.4 [Operating Environment](#24-operating-environment)
   - 2.5 [Design and Implementation Constraints](#25-design-and-implementation-constraints)
   - 2.6 [Assumptions and Dependencies](#26-assumptions-and-dependencies)
3. [System Features and Requirements](#3-system-features-and-requirements)
   - 3.1 [Product Browsing and Catalog](#31-product-browsing-and-catalog)
   - 3.2 [User Authentication](#32-user-authentication)
   - 3.3 [Shopping Cart](#33-shopping-cart)
   - 3.4 [Wishlist](#34-wishlist)
   - 3.5 [Checkout and Payment](#35-checkout-and-payment)
   - 3.6 [Order Management](#36-order-management)
   - 3.7 [Admin Panel](#37-admin-panel)
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 [User Interfaces](#41-user-interfaces)
   - 4.2 [Hardware Interfaces](#42-hardware-interfaces)
   - 4.3 [Software Interfaces](#43-software-interfaces)
   - 4.4 [Communication Interfaces](#44-communication-interfaces)
5. [Non-Functional Requirements](#5-non-functional-requirements)
   - 5.1 [Performance Requirements](#51-performance-requirements)
   - 5.2 [Security Requirements](#52-security-requirements)
   - 5.3 [Usability Requirements](#53-usability-requirements)
   - 5.4 [Scalability Requirements](#54-scalability-requirements)
   - 5.5 [Reliability Requirements](#55-reliability-requirements)
6. [Technical Architecture](#6-technical-architecture)
   - 6.1 [Technology Stack](#61-technology-stack)
   - 6.2 [Project Structure](#62-project-structure)
   - 6.3 [Data Models](#63-data-models)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the Jaatland E-Commerce Web Application. It outlines the functional and non-functional requirements, system features, external interfaces, and technical architecture of the platform. This document is intended for:

- **Developers:** To understand the system requirements and implement features accordingly
- **Project Managers:** To track project scope and deliverables
- **QA Engineers:** To develop test plans and ensure quality compliance
- **Stakeholders:** To understand the system capabilities and business value

### 1.2 Scope

Jaatland is a premium clothing e-commerce platform designed to sell high-quality fashion items including:

- Men's clothing (T-shirts, hoodies, joggers)
- Women's clothing (Crop tops, casual wear)
- Unisex apparel
- Fashion accessories (Bags, totes)

**Key Capabilities:**
- Product catalog browsing with advanced filtering
- User authentication (Login/Signup)
- Shopping cart management
- Wishlist functionality
- Secure payment processing via Stripe
- Order tracking and history
- Admin panel for product and content management
- Dark/Light theme support
- Responsive design for all devices

**Out of Scope (Current Version):**
- Inventory management system
- Multi-vendor marketplace
- Mobile native applications
- Advanced analytics dashboard
- Customer review and rating system

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| UI | User Interface |
| UX | User Experience |
| API | Application Programming Interface |
| EUR | Euro (Currency) |
| SKU | Stock Keeping Unit |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token |
| SSR | Server-Side Rendering |
| CSR | Client-Side Rendering |

### 1.4 References

- Next.js Documentation: https://nextjs.org/docs
- Stripe API Documentation: https://stripe.com/docs
- React Documentation: https://react.dev
- Tailwind CSS Documentation: https://tailwindcss.com/docs

### 1.5 Overview

This document is organized into seven main sections covering introduction, overall description, system features, external interfaces, non-functional requirements, technical architecture, and appendices.

---

## 2. Overall Description

### 2.1 Product Perspective

Jaatland is a standalone e-commerce web application built using modern web technologies. The system operates as a client-side rendered React application with Next.js framework, utilizing localStorage for data persistence and Stripe for payment processing.

**System Context Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         JAATLAND SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────────┐     │
│   │  Users   │───▶│   Next.js    │───▶│  LocalStorage    │     │
│   │(Browser) │    │  Frontend    │    │  (Data Store)    │     │
│   └──────────┘    └──────┬───────┘    └──────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│                  ┌───────────────┐                               │
│                  │   Stripe API  │                               │
│                  │   (Payments)  │                               │
│                  └───────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Product Functions

The main functions of the Jaatland e-commerce platform are:

| Function Category | Features |
|-------------------|----------|
| **Product Management** | Browse products, View details, Filter/Sort, Search |
| **User Management** | Registration, Login, Profile management |
| **Cart Operations** | Add to cart, Update quantity, Remove items |
| **Wishlist** | Add/Remove favorites, Persist across sessions |
| **Checkout** | Shipping info, Payment processing, Order confirmation |
| **Order Tracking** | View order history, Track order status |
| **Admin Functions** | Product CRUD, Homepage customization, Analytics overview |
| **Personalization** | Dark/Light theme, Filter preferences |

### 2.3 User Classes and Characteristics

#### 2.3.1 Guest User
- Can browse products and view details
- Can add items to cart
- Cannot checkout without authentication
- Cannot access wishlist
- Cannot view order history

#### 2.3.2 Registered Customer
- Full access to shopping features
- Can complete purchases
- Wishlist functionality
- Order history and tracking
- Profile management

#### 2.3.3 Administrator
- Access to admin panel
- Product management (CRUD operations)
- Homepage content customization
- View sales overview

### 2.4 Operating Environment

**Client Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Minimum screen resolution: 320px width (mobile responsive)
- Internet connection required

**Server Requirements:**
- Node.js 18.x or higher
- Hosting platform supporting Next.js (Vercel recommended)
- SSL certificate for secure transactions

### 2.5 Design and Implementation Constraints

1. **Technology Constraints:**
   - Built with Next.js 15.x and React 19.x
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Stripe for payment processing only

2. **Data Storage:**
   - Currently uses localStorage for data persistence
   - No backend database in current version

3. **Payment:**
   - Limited to Stripe payment gateway
   - EUR currency only

4. **Browser Support:**
   - Modern browsers with ES6+ support required

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have stable internet connectivity
- Users have JavaScript enabled in browsers
- Payment information is handled securely by Stripe

**Dependencies:**
- Stripe API availability for payments
- Third-party UI component libraries (Radix UI)
- External CDN for product images

---

## 3. System Features and Requirements

### 3.1 Product Browsing and Catalog

#### 3.1.1 Description
Users can browse the product catalog with various filtering and sorting options.

#### 3.1.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PC-001 | System shall display all products on the homepage | High |
| FR-PC-002 | System shall allow filtering by category (Men, Women, Unisex, Accessories) | High |
| FR-PC-003 | System shall allow filtering by size (XS, S, M, L, XL, XXL) | High |
| FR-PC-004 | System shall allow filtering by color | Medium |
| FR-PC-005 | System shall allow filtering by price range using slider | Medium |
| FR-PC-006 | System shall provide sorting options (Featured, Price Low-High, Price High-Low, Name A-Z) | High |
| FR-PC-007 | System shall support product search by name | High |
| FR-PC-008 | System shall display product cards with image, name, price, and badges | High |
| FR-PC-009 | System shall provide detailed product view page | High |
| FR-PC-010 | System shall display similar/related products | Medium |
| FR-PC-011 | System shall support multiple product images with carousel | Medium |

#### 3.1.3 Use Case: Browse Products

**Actor:** User (Guest/Registered)

**Preconditions:** User has accessed the website

**Main Flow:**
1. User lands on homepage
2. System displays product grid with all products
3. User applies filters (category, size, color, price)
4. System updates product display based on filters
5. User clicks on product card
6. System navigates to product detail page
7. System displays product information, images, sizes, and similar products

**Alternative Flow:**
- If no products match filters, system displays "No products found" message

---

### 3.2 User Authentication

#### 3.2.1 Description
Users can create accounts and authenticate to access personalized features.

#### 3.2.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-UA-001 | System shall provide user registration with email and password | High |
| FR-UA-002 | System shall provide user login functionality | High |
| FR-UA-003 | System shall validate email format during registration | High |
| FR-UA-004 | System shall require password confirmation during registration | High |
| FR-UA-005 | System shall persist user session in localStorage | High |
| FR-UA-006 | System shall provide logout functionality | High |
| FR-UA-007 | System shall display user email in navigation when logged in | Medium |
| FR-UA-008 | System shall redirect unauthenticated users from protected pages | High |

#### 3.2.3 Use Case: User Registration

**Actor:** Guest User

**Preconditions:** User is not logged in

**Main Flow:**
1. User clicks "Login" button in navigation
2. System displays authentication modal
3. User clicks "Create Account"
4. User enters email, password, and confirm password
5. System validates input
6. System creates account and logs user in
7. System closes modal and updates UI

**Alternative Flow:**
- Invalid email format: System displays error message
- Passwords don't match: System displays error message
- Email already exists: System displays error message

---

### 3.3 Shopping Cart

#### 3.3.1 Description
Users can add products to cart, modify quantities, and proceed to checkout.

#### 3.3.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SC-001 | System shall allow adding products to cart | High |
| FR-SC-002 | System shall require size selection before adding to cart | High |
| FR-SC-003 | System shall update cart quantity for existing items | High |
| FR-SC-004 | System shall allow removing items from cart | High |
| FR-SC-005 | System shall display cart item count in navigation badge | High |
| FR-SC-006 | System shall persist cart data in localStorage | High |
| FR-SC-007 | System shall calculate and display subtotal | High |
| FR-SC-008 | System shall provide cart slide-out panel | Medium |
| FR-SC-009 | System shall provide "Proceed to Checkout" action | High |
| FR-SC-010 | System shall display cart items with image, name, size, quantity, price | High |

#### 3.3.3 Use Case: Add to Cart

**Actor:** User (Guest/Registered)

**Preconditions:** User is viewing a product

**Main Flow:**
1. User selects product size
2. User clicks "Add to Cart" button
3. System adds item to cart
4. System updates cart badge count
5. System shows confirmation feedback

**Alternative Flow:**
- No size selected: System prompts user to select size
- Item already in cart: System increments quantity

---

### 3.4 Wishlist

#### 3.4.1 Description
Registered users can save products to a wishlist for future purchase.

#### 3.4.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-WL-001 | System shall allow adding products to wishlist | Medium |
| FR-WL-002 | System shall allow removing products from wishlist | Medium |
| FR-WL-003 | System shall display wishlist count in navigation | Low |
| FR-WL-004 | System shall persist wishlist in localStorage | Medium |
| FR-WL-005 | System shall show heart icon indicator on wishlisted products | Medium |
| FR-WL-006 | System shall require authentication for wishlist access | Medium |

---

### 3.5 Checkout and Payment

#### 3.5.1 Description
Users can complete purchases with shipping information and secure payment via Stripe.

#### 3.5.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CP-001 | System shall collect shipping information (name, email, address, city, postal code, country) | High |
| FR-CP-002 | System shall validate all shipping fields | High |
| FR-CP-003 | System shall integrate Stripe payment element | High |
| FR-CP-004 | System shall create Stripe PaymentIntent via API | High |
| FR-CP-005 | System shall process payment securely | High |
| FR-CP-006 | System shall display order summary during checkout | High |
| FR-CP-007 | System shall show payment processing status | High |
| FR-CP-008 | System shall redirect to confirmation on successful payment | High |
| FR-CP-009 | System shall clear cart after successful order | High |
| FR-CP-010 | System shall create and store order record | High |

#### 3.5.3 Use Case: Complete Checkout

**Actor:** Registered Customer

**Preconditions:** User is logged in and has items in cart

**Main Flow:**
1. User clicks "Proceed to Checkout"
2. System navigates to checkout page
3. System displays order summary
4. User enters shipping information
5. System validates shipping info
6. User enters payment details in Stripe element
7. User clicks "Pay Now"
8. System creates PaymentIntent
9. Stripe processes payment
10. System creates order record
11. System clears cart
12. System redirects to order confirmation

**Alternative Flow:**
- Invalid shipping info: System displays validation errors
- Payment declined: System displays error message
- Network error: System displays retry option

---

### 3.6 Order Management

#### 3.6.1 Description
Users can view their order history and track order status.

#### 3.6.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-OM-001 | System shall display list of user orders | High |
| FR-OM-002 | System shall show order details (items, total, date) | High |
| FR-OM-003 | System shall display order status (Processing, Shipped, Delivered) | High |
| FR-OM-004 | System shall show shipping information for each order | Medium |
| FR-OM-005 | System shall require authentication to view orders | High |
| FR-OM-006 | System shall persist orders in localStorage | High |

---

### 3.7 Admin Panel

#### 3.7.1 Description
Administrators can manage products and customize homepage content.

#### 3.7.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AP-001 | System shall provide admin panel accessible via /admin | High |
| FR-AP-002 | System shall allow adding new products | High |
| FR-AP-003 | System shall allow editing existing products | High |
| FR-AP-004 | System shall allow deleting products | High |
| FR-AP-005 | System shall allow customizing homepage hero section | Medium |
| FR-AP-006 | System shall allow customizing newsletter section | Medium |
| FR-AP-007 | System shall allow configuring featured products per category | Medium |
| FR-AP-008 | System shall display analytics overview | Low |
| FR-AP-009 | System shall support product image URL input | High |
| FR-AP-010 | System shall validate product form fields | High |

#### 3.7.3 Product Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique product identifier |
| name | string | Yes | Product name |
| price | number | Yes | Product price in EUR |
| category | enum | Yes | Men, Women, Unisex, Accessories |
| color | string | Yes | Product color |
| size | string[] | Yes | Available sizes |
| images | string[] | Yes | Product image URLs |
| badge | string | No | Product badge (New, Bestseller, Limited) |
| similarIds | string[] | No | Related product IDs |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Navigation Bar
- Logo/Brand name (links to homepage)
- Search input field
- Category dropdown
- Theme toggle (Dark/Light)
- Wishlist icon with count badge
- Shopping cart icon with count badge
- User account dropdown

#### 4.1.2 Homepage Layout
- Hero section with customizable title, subtitle, and image
- Category-based product grids
- Filter sidebar (responsive)
- Newsletter subscription section
- Footer with social links and policies

#### 4.1.3 Product Card
- Product image (hover effects)
- Product name
- Price (EUR format)
- Badge indicator (if applicable)
- Quick action buttons (wishlist, add to cart)

#### 4.1.4 Product Detail Page
- Image carousel
- Product information
- Size selector
- Add to cart button
- Wishlist button
- Similar products section

#### 4.1.5 Checkout Page
- Order summary panel
- Shipping information form
- Stripe payment element
- Action buttons

### 4.2 Hardware Interfaces

No specific hardware interfaces required. The application runs on standard web browsers.

### 4.3 Software Interfaces

#### 4.3.1 Stripe Payment API
- **Purpose:** Process payments securely
- **Interface:** REST API
- **Endpoints Used:**
  - `POST /v1/payment_intents` - Create payment intent
- **Data Format:** JSON
- **Authentication:** API Key (Secret Key)

#### 4.3.2 LocalStorage API
- **Purpose:** Client-side data persistence
- **Keys Used:**
  - `jaatland_cart` - Shopping cart data
  - `jaatland_wishlist` - Wishlist items
  - `jaatland_theme` - Theme preference
  - `jaatland_user` - User session data
  - `jaatland_orders` - Order history
  - `jaatland_products` - Product catalog
  - `jaatland_homepage` - Homepage configuration

### 4.4 Communication Interfaces

- **HTTP/HTTPS:** All client-server communication
- **TLS 1.3:** Secure data transmission
- **JSON:** Data exchange format

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-P-001 | Initial page load time | < 3 seconds on 3G |
| NFR-P-002 | Time to Interactive (TTI) | < 5 seconds |
| NFR-P-003 | Filter/Sort response time | < 500ms |
| NFR-P-004 | Cart operations | < 200ms |
| NFR-P-005 | Checkout page load | < 2 seconds |
| NFR-P-006 | Payment processing feedback | < 10 seconds |

### 5.2 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-S-001 | All payment data handled by Stripe (PCI compliant) | High |
| NFR-S-002 | HTTPS required for all communications | High |
| NFR-S-003 | User passwords not stored in plain text | High |
| NFR-S-004 | Input validation on all forms | High |
| NFR-S-005 | XSS protection via React's default escaping | High |
| NFR-S-006 | Stripe API keys secured via environment variables | High |

### 5.3 Usability Requirements

| ID | Requirement |
|----|-------------|
| NFR-U-001 | Responsive design supporting mobile, tablet, and desktop |
| NFR-U-002 | Accessible color contrast (WCAG 2.1 AA) |
| NFR-U-003 | Clear error messages with recovery guidance |
| NFR-U-004 | Consistent navigation across all pages |
| NFR-U-005 | Dark/Light theme support |
| NFR-U-006 | Loading states for async operations |

### 5.4 Scalability Requirements

| ID | Requirement |
|----|-------------|
| NFR-SC-001 | Support 100+ products without performance degradation |
| NFR-SC-002 | Support concurrent user sessions via stateless frontend |
| NFR-SC-003 | Deployable to CDN for global access |

### 5.5 Reliability Requirements

| ID | Requirement |
|----|-------------|
| NFR-R-001 | Graceful handling of network failures |
| NFR-R-002 | LocalStorage fallback for data persistence |
| NFR-R-003 | Cart data survives page refresh |
| NFR-R-004 | Error boundaries for component failures |

---

## 6. Technical Architecture

### 6.1 Technology Stack

#### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.4.6 | React framework with SSR/CSR |
| React | 19.1.0 | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Radix UI | Various | Accessible UI primitives |
| Lucide React | 0.540.0 | Icon library |

#### Backend/API
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | - | Serverless functions |
| Stripe SDK | 19.3.1 | Payment processing |

#### Development Tools
| Tool | Purpose |
|------|---------|
| Vitest | Unit testing |
| Testing Library | Component testing |
| ESLint | Code linting |
| TypeScript | Type checking |

### 6.2 Project Structure

```
jaatland-project/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── admin/
│   │   │   └── page.tsx        # Admin panel
│   │   ├── api/
│   │   │   └── create-payment-intent/
│   │   │       └── route.ts    # Stripe API endpoint
│   │   ├── checkout/
│   │   │   └── page.tsx        # Checkout page
│   │   ├── orders/
│   │   │   └── page.tsx        # Order history
│   │   └── product/
│   │       └── [id]/
│   │           └── page.tsx    # Product detail (dynamic)
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       └── slider.tsx
│   └── lib/
│       ├── types.ts            # TypeScript type definitions
│       └── utils.ts            # Utility functions
├── components.json             # shadcn/ui configuration
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

### 6.3 Data Models

#### Product Model
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Men' | 'Women' | 'Unisex' | 'Accessories';
  color: string;
  size: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One')[];
  images: string[];
  badge?: string;
  similarIds: string[];
}
```

#### Cart Item Model
```typescript
interface CartItem {
  id: string;
  size: string;
  qty: number;
}
```

#### Order Model
```typescript
interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingInfo: ShippingInfo;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}
```

#### User Model
```typescript
interface User {
  email: string;
}
```

#### Homepage Configuration Model
```typescript
interface HomepageConfig {
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
```

---

## 7. Appendices

### Appendix A: Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |

### Appendix B: API Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/create-payment-intent` | POST | Create Stripe PaymentIntent | `{ amount: number }` | `{ clientSecret: string }` |

### Appendix C: LocalStorage Keys Reference

| Key | Data Type | Description |
|-----|-----------|-------------|
| `jaatland_cart` | CartItem[] | Shopping cart items |
| `jaatland_wishlist` | string[] | Wishlisted product IDs |
| `jaatland_theme` | string | "dark" or "light" |
| `jaatland_user` | User | Current user session |
| `jaatland_orders` | Order[] | User order history |
| `jaatland_products` | Product[] | Product catalog (admin managed) |
| `jaatland_homepage` | HomepageConfig | Homepage customization |
| `jaatland_price` | [number, number] | Price filter range |
| `jaatland_sort` | string | Sort preference |

### Appendix D: Future Enhancements (Roadmap)

1. **Phase 2:**
   - Backend database integration (PostgreSQL/MongoDB)
   - User authentication with JWT
   - Real inventory management
   - Email notifications

2. **Phase 3:**
   - Product reviews and ratings
   - Advanced search with Elasticsearch
   - Multi-currency support
   - Multiple payment gateways

3. **Phase 4:**
   - Mobile app (React Native)
   - Multi-vendor support
   - Analytics dashboard
   - AI-powered recommendations

---

**Document Prepared By:** Development Team  
**Last Updated:** January 11, 2026  
**Status:** Approved  

---

*© 2026 Jaatland. All rights reserved.*
