# Jaatland

A demo storefront for **Jaatland Clothing Co.** — a full e-commerce front end (browse, filter, cart, wishlist, checkout, orders, admin) built with Next.js and shadcn/ui. Everything runs client-side against `localStorage`, so there is no database or backend.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                | What it does                             |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Development server (Turbopack)           |
| `npm run build`       | Production build                         |
| `npm run start`       | Serve the production build               |
| `npm run lint`        | ESLint (flat config, Next 16 rules)      |
| `npm run typecheck`   | TypeScript, no emit                      |
| `npm run test`        | Vitest watch mode                        |
| `npm run test:run`    | Vitest single run                        |
| `npm run test:coverage` | Vitest with coverage report            |

## Demo accounts

Auth is stored in `localStorage` only — it is a demo, not real security. Passwords sit in plain text in the browser and ship in the client bundle. Do not reuse a real password.

- **Admin** — `krishahir@jaatland.com` / `1234`. Logs into `/admin` for product and homepage editing plus store stats.
- **Customer** — create one from the login dialog, or log in as an existing local account.

## How it works

There is no server. Products, cart, wishlist, orders, the homepage layout, and the signed-in user all live in `localStorage` under the `jaatland_` prefix (`src/lib/mock-data.ts` holds the seed catalog and key names). The catalog you see is seeded from `DEFAULT_PRODUCTS` the first time you load.

Checkout is deliberately simulated. The payment form is never charged, and card details are not stored or transmitted anywhere — shipping records keep only name, email, and address.

### Stripe test configuration

The `/api/create-payment-intent` endpoint creates real EUR card payment intents when configured with a Stripe test secret in `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
```

The storefront does not call this endpoint yet — checkout is a client-side simulation. Use a test key for development, and never commit `.env.local` or a real secret key.

## Features

- **Browse** — four categories (Men, Women, Unisex, Accessories) with featured and per-category sections
- **Search, filter, sort** — live text search plus size/color/price-range filters and four sort orders; active filters switch the grid to a single results view
- **Cart & wishlist** — side sheets with quantity controls, persisted across pages and reloads
- **Product detail** — image gallery, size picker, and related products
- **Checkout & orders** — simulated payment, then an order history scoped to the signed-in user
- **Admin** — product CRUD, homepage copy/hero editing, and store stats read from real local data
- **Dark mode** — persisted preference, applied before first paint to avoid a flash
- **Responsive** — mobile menu sheet with search, filters, and sort

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui on Radix primitives · Lucide icons · Framer Motion · Stripe (optional, endpoint only).

## Project layout

```
src/
  app/            Routes: /, /product/[id], /checkout, /orders, /admin, error + not-found boundaries
  components/
    ui/           shadcn/ui primitives (button, card, sheet, dialog, …)
    product-card.tsx
    product-image.tsx  Image with placeholder + broken-URL fallback
  lib/
    mock-data.ts  Seed catalog, categories, sizes, colors, localStorage keys, admin creds
    types.ts      Shared types
    utils.ts      cn(), currency, image, id helpers
```

## Notes for a real deployment

This is a portfolio/demo build. Before it could take real orders it needs a database, server-side auth, wiring the checkout UI to the payment endpoint, and server-rendered product pages. Review authentication, order persistence, and payment handling before any production use.
