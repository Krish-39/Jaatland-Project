# Jaatland

**Live demo:** <https://store.krriss.cloud>

A storefront demo for **Jaatland Clothing Co.** It is a complete, client-side e-commerce front end: browse a catalog, search and filter it, fill a cart and wishlist, check out, read back your orders, and edit products and homepage copy from an admin panel.

There is no backend and no database. The catalog, cart, wishlist, orders, signed-in user, theme, and homepage copy all live in the browser's `localStorage`. That is what makes it a one-command demo, and it is also why none of it is production-grade. See [Demo security](#demo-security).

## Quick start

Node 20.9 or newer is required (Next.js 16's minimum).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts

Login is a `localStorage` check, not authentication, so treat these as sample values.

| Role | Email | Password | What it unlocks |
| --- | --- | --- | --- |
| Admin | `krishahir@jaatland.com` | `1234` | Skips straight to `/admin`: dashboard stats, product CRUD, homepage editor |
| Customer | any email you enter in the login dialog | your choice, 6+ characters | Cart, wishlist, and `/orders` scoped to that email |

Registration keeps a single account per browser (one `jaatland_user_email` key), stored in plain text.

## What you can do

**Shopping**

- Browse four categories (Men, Women, Unisex, Accessories) with a featured row plus one section per category.
- Search by name, filter by category, size, colour, and price range, and sort four ways. Any active filter swaps the homepage grid for a single results view.
- Add to cart from a card or the product page. Lines split by size, so the same shirt in M and L are separate entries.
- Watch the cart's free-shipping bar fill toward **€40**, with a toast confirming each change.

**Product detail**

- Image gallery, size picker, price, badge, and related products drawn from each product's `similarIds`.

**Checkout and orders**

- Shipping form, card form with live input formatting, and an order summary.
- Payment is simulated: the card is never charged and never stored.
- Order history is scoped to the signed-in email, or to the email used at the last guest checkout on that browser.

**Admin** (`/admin`)

- Dashboard: total products, total orders, revenue, wishlist items, and recent orders, all read from local data.
- Products: create, edit, and delete catalog entries, including images, sizes, badge, and related products.
- Homepage: edit the hero title, subtitle, and image, the newsletter copy, and which products appear in each category row.

**Everywhere**

- Dark mode applied before first paint, so there is no flash of the wrong theme.
- Responsive layout. On mobile the header collapses into a sheet carrying search, filters, and sort.
- Loading skeletons, keyboard-accessible controls, and ARIA labels on the interactive pieces.

## How it works

### No server, one store

Every page is a client component reading from a single `StoreProvider` (`src/components/store-provider.tsx`). The provider renders the seeded defaults on the server, hydrates from `localStorage` once on mount, then writes cart, wishlist, and user back on every change. Pages never prop-drill state to each other; they call `useStore()`.

```
                    ┌────────────────────────────────┐
                    │   StoreProvider (client)       │
                    │   products · homepage config   │
                    │   cart · wishlist · user       │
                    │   toasts                       │
                    └───────────────┬────────────────┘
                                    │ useStore()
        ┌───────────┬───────────────┼──────────────┬────────────┐
        ▼           ▼               ▼              ▼            ▼
    store-header  homepage     product detail  checkout     admin
    (nav+filters)   grid                        orders       panel
                                    │
                                    ▼
                     localStorage  (keys prefixed jaatland_)
```

### Order snapshots

`createOrder()` (`src/lib/orders.ts`) copies the name, price, and image onto every line at purchase time. Editing or deleting a product later cannot rewrite history, so an order always shows what was actually bought and at what price. Orders saved by older builds, which stored only an id and quantity, resolve against the live catalog as a fallback via `resolveOrderItem`.

### Order history scoping

There are no accounts to look up, so `/orders` filters stored orders by the signed-in email or, for guests, by the email recorded at the last checkout on that browser. `orderBelongsTo` does a case-insensitive match against either the order email or the shipping email, which also covers legacy orders that only stored the latter.

### Guarded storage

Every read and write goes through `src/lib/storage.ts`. One corrupt `localStorage` entry used to throw during render and take the whole page down, so `readJson`, `readArray`, and friends swallow parse errors and return a fallback. Writes return `false` instead of throwing when storage is full or disabled, and the store surfaces that as a toast.

### Filters shared across the header and the grid

`useProductFilters` (`src/hooks/use-product-filters.ts`) owns query, category, size, colour, sort, and price range, so the header's controls and the homepage grid stay in sync without a dozen setters passed down. Sort and price range persist across reloads. The price range also stores the bounds it was chosen against, so a range the user narrowed stays put when the catalog changes while an untouched one follows the new bounds.

### Theme without a flash

`src/app/layout.tsx` inlines a small script in `<head>` that adds the `dark` class before first paint if `jaatland_theme` is `dark`. React re-applies it afterward, with `suppressHydrationWarning` on `<html>` to cover the class the script already set.

## Reference

### Scripts

| Script | Command | Notes |
| --- | --- | --- |
| `npm run dev` | `next dev --turbopack` | Dev server on port 3000 |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Serve the production build |
| `npm run lint` | `eslint .` | Flat config, Next 16 rules |
| `npm run typecheck` | `tsc --noEmit` | Types only, no emit |
| `npm run test` | `vitest` | Watch mode |
| `npm run test:run` | `vitest run` | Single run, the one to use in CI |
| `npm run test:coverage` | `vitest run --coverage` | V8 coverage |
| `npm run test:ui` | `vitest --ui` | Needs `@vitest/ui` installed: `npm i -D @vitest/ui` |

### Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Hero, featured row, per-category sections, newsletter |
| `/product/[id]` | `src/app/product/[id]/page.tsx` | Product detail; `layout.tsx` sets per-product metadata |
| `/checkout` | `src/app/checkout/page.tsx` | Shipping, simulated payment, confirmation |
| `/orders` | `src/app/orders/page.tsx` | Order history for the current viewer |
| `/admin` | `src/app/admin/page.tsx` | Dashboard, products, homepage editor |
| `POST /api/create-payment-intent` | `src/app/api/create-payment-intent/route.ts` | Stripe PaymentIntent (not called by the UI) |
| (boundaries) | `src/app/error.tsx`, `src/app/not-found.tsx` | Error and 404 screens |

### Browser storage keys

All keys are prefixed `jaatland_` and declared in `LS_KEYS` (`src/lib/mock-data.ts`).

| Key | Holds |
| --- | --- |
| `jaatland_products` | Admin-edited catalog (JSON array of `Product`) |
| `jaatland_homepage` | Admin-edited hero, newsletter copy, per-category product ids |
| `jaatland_cart` | Cart lines: `{ id, size, qty }` |
| `jaatland_wishlist` | Product ids |
| `jaatland_orders` | Order records |
| `jaatland_buyer_email` | Email from the last guest checkout |
| `jaatland_user` | Signed-in `{ email }` |
| `jaatland_user_email`, `jaatland_user_password` | Registered demo account (plain text) |
| `jaatland_admin_email` | Admin email used at login |
| `jaatland_theme` | `"dark"` when set; anything else is light |
| `jaatland_sort` | Persisted sort option |
| `jaatland_price` | Persisted `{ range, bounds }` for the price slider |
| `jaatland_newsletter_email` | Newsletter signup email |

### Catalog constants

`src/lib/mock-data.ts` seeds `DEFAULT_PRODUCTS` (6 items) and defines the filter vocabulary:

- **Categories:** Men, Women, Unisex, Accessories
- **Sizes:** XS, S, M, L, XL, XXL (plus `One` for accessories, in the `ProductSize` type)
- **Colours:** Black, White, Blue, Beige, Olive, Maroon

### Payment endpoint

`POST /api/create-payment-intent` returns a Stripe client secret. It exists so payments can be wired up later; the storefront never calls it, which is why checkout works without a key.

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_your_key_here
```

Request body:

```json
{ "items": [ { "id": "p1", "qty": 2 } ] }
```

| Behaviour | Detail |
| --- | --- |
| Pricing | Recomputed server-side from `DEFAULT_PRODUCTS`; an amount supplied by the client is ignored |
| Limits | 1 to 50 lines; each `qty` an integer from 1 to 99; unknown product ids rejected |
| Currency | EUR, card only |
| Responses | `200 { clientSecret }`, `400` bad body or unknown product, `503` no key configured, `500` provider error (details logged server-side only) |

### Project layout

```
src/
  app/                 Routes, error/not-found boundaries, the payment route
  components/
    ui/                shadcn/ui primitives (button, card, sheet, dialog, slider, ...)
    store-provider.tsx Global state and toasts (useStore)
    store-header.tsx   Sticky nav, search, filter/sort menus, cart + wishlist sheets
    store-footer.tsx   Newsletter signup, links, social icons
    hero.tsx           Homepage hero (admin-editable copy and image)
    login-dialog.tsx   Login and register dialog
    product-card.tsx   Grid card
    product-image.tsx  next/image with a placeholder and broken-URL fallback
    product-grid-skeleton.tsx  Loading skeletons for the grid and product page
  hooks/
    use-product-filters.ts  Shared search, filter, sort, and price state
  lib/
    mock-data.ts  Seed catalog, constants, storage keys, admin credentials
    orders.ts     Order snapshots, totals, buyer matching (pure, tested)
    storage.ts    Guarded localStorage reads and writes (tested)
    types.ts      Shared types
    utils.ts      cn(), EUR formatting, image and id helpers (tested)
public/               Brand favicon plus unused Next.js SVG placeholders
```

## Common tasks

### Reset the demo to a clean state

Clear the app's keys, then reload. In the browser console:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith("jaatland_"))
  .forEach((key) => localStorage.removeItem(key));
```

The catalog, cart, orders, theme, and admin edits all return to their seeded defaults on the next load. DevTools > Application > Local Storage > delete the same keys works too.

### Add a product

Go to `/admin`, log in, open the **Products** tab, and choose **Add Product**. The form covers name, price (EUR), category, colour, sizes, image URLs, an optional badge, and related products. Saving writes the whole catalog to `jaatland_products`, so the change is per-browser and survives reloads.

### Change the homepage copy

Go to `/admin` > **Homepage**. The hero title, subtitle, and image come from here, as do the newsletter title and subtitle and the product selection for each category row. Clearing a hero field leaves the section empty rather than reverting to the default.

## Testing

25 unit tests across three files. They cover pure logic rather than rendered components:

```bash
npm run test:run      # orders (12), storage (10), utils (3)
npm run typecheck
npm run lint
```

`storage.test.ts` runs under jsdom, declared inline with `// @vitest-environment jsdom`, because it exercises `window.localStorage`. The rest run in the default node environment. Component behaviour is checked by hand in the browser, not by tests.

## Known gaps

- **Two seed products fall outside the colour filter.** `COLORS` lists Black, White, Blue, Beige, Olive, and Maroon, but the seed catalog includes a Gray hoodie (`p4`) and a Red tote (`p6`). Both render fine, but no colour filter can select them.
- **Product metadata reads only the seed catalog.** `src/app/product/[id]/layout.tsx` builds its title and description from `DEFAULT_PRODUCTS`, so a product added through the admin panel shows `"Product not found | Jaatland"` as its tab title.
- **Stripe client packages are installed but unused.** `@stripe/react-stripe-js` and `@stripe/stripe-js` sit in `package.json` and nothing imports them; only the server SDK is used, by the payment route.
- **`npm run test:ui` needs `@vitest/ui`.** It is not in `devDependencies`, so the script fails until you install it.
- **Unused starter assets.** `public/` still carries `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and `window.svg` from the Next.js starter. Nothing imports them.
- **Product images are hotlinked.** `next.config.ts` allowlists seven external hosts (Unsplash, Zalando, iStock, Shutterstock, and three Google image hosts). If any URL rots, the card falls back to a placeholder.

## Demo security

Auth, the admin gate, and order history are all `localStorage` reads, and `ADMIN_PASSWORD` is compiled into the client bundle. That means:

- Anyone can open DevTools, set `jaatland_user` to `{"email":"krishahir@jaatland.com"}`, and reach `/admin`.
- Anyone can edit `jaatland_orders` to rewrite or fabricate an order.
- Passwords are stored in plain text and shipped to every visitor.
- Client-side checks are not authorization. There is no server to enforce anything.

Use throwaway credentials, and never put real data in this build.

## Notes for a real deployment

Before this can take real orders it needs a database, server-side sessions and authorization, product pages rendered from that database rather than a bundled seed, and the checkout UI wired to the payment endpoint. The payment route already prices the order from a server-side catalog instead of trusting the client for an amount, but checkout still charges nothing and stores no card data.
