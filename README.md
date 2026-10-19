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

All shared state lives in one client-side `StoreProvider` (`src/components/store-provider.tsx`), so the header, homepage grid, product page, checkout, orders, and admin all read and write the same catalog, cart, wishlist, and user. The homepage's search/filter/sort state is shared with the header through `src/hooks/use-product-filters.ts`.

### Stripe test configuration

The `/api/create-payment-intent` endpoint creates real EUR card payment intents when configured with a Stripe test secret in `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
```

The storefront does not call this endpoint yet — checkout is a client-side simulation. Use a test key for development, and never commit `.env.local` or a real secret key.

## Features

- **Browse** — four categories (Men, Women, Unisex, Accessories) with featured and per-category sections
- **Search, filter, sort** — live text search plus size/color/price-range filters and four sort orders; active filters switch the grid to a single results view
- **Cart & wishlist** — side sheets with quantity controls, a free-shipping progress bar, and toast feedback, persisted across pages and reloads
- **Product detail** — image gallery, size picker, and related products
- **Checkout & orders** — simulated payment, then an order history scoped to the signed-in user or to the email used for the last guest checkout on that browser
- **Admin** — product CRUD, homepage copy/hero editing, and store stats read from real local data
- **Dark mode** — persisted preference, applied before first paint to avoid a flash
- **Responsive** — mobile menu sheet with search, filters, and sort
- **Polish** — loading skeletons, non-blocking toast confirmations, formatted card inputs, and keyboard/ARIA labels throughout

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui on Radix primitives · Lucide icons · Framer Motion · Stripe (optional, endpoint only).

## Project layout

```
src/
  app/            Routes: /, /product/[id], /checkout, /orders, /admin, error + not-found boundaries
  components/
    ui/           shadcn/ui primitives (button, card, sheet, dialog, …)
    store-provider.tsx  Global products/cart/wishlist/user/toast state (useStore)
    store-header.tsx    Sticky header, cart + wishlist sheets, mobile menu, filters
    hero.tsx            Homepage hero (admin-editable copy + image)
    store-footer.tsx    Newsletter + footer links
    product-card.tsx
    product-image.tsx  Image with placeholder + broken-URL fallback
    product-grid-skeleton.tsx  Loading skeletons for the grid and product page
  hooks/
    use-product-filters.ts  Shared search/filter/sort/price state
  lib/
    mock-data.ts  Seed catalog, categories, sizes, colors, localStorage keys, admin creds
    orders.ts     Order snapshots, totals, and buyer matching (pure helpers)
    storage.ts    Guarded localStorage reads/writes (corrupt entries never crash a page)
    types.ts      Shared types
    utils.ts      cn(), currency, image, id helpers
```

## Demo security

This build has no backend. Authentication, the admin gate, and order history live in
`localStorage`, and `ADMIN_PASSWORD` in `src/lib/mock-data.ts` is baked into the client
bundle. Treat all of it as demo-only:

- Do not reuse a real password, and do not ship these credentials to production.
- Anyone can edit `localStorage` to unlock `/admin` or change an order; client-side checks
  are not authorization.
- Password hashing, server sessions, and a real database are required before this can
  handle real accounts. See “Notes for a real deployment”.

## Notes for a real deployment

This is a portfolio/demo build. Before it could take real orders it needs a database, server-side auth, wiring the checkout UI to the payment endpoint, and server-rendered product pages. Review authentication, order persistence, and payment handling before any production use.

The payment endpoint prices `{ items: [{ id, qty }] }` from the server catalog rather than
accepting an amount from the client, but the storefront does not call it yet. The checkout
flow is still simulated and stores no card data.

## Tests

```bash
npm run test:run    # Vitest unit tests for order snapshots, storage guards, formatting
npm run typecheck
npm run lint
```
