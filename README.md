# Jaatland

**Live demo:** <https://store.krriss.cloud>

A storefront for **Jaatland Clothing Co.**, built as a production-grade demo: a real database, real accounts with server-side sessions, a server-enforced admin area, and the legal pages a German online shop needs. It is clearly labelled as a demo: nothing is sold, charged or shipped.

## Quick start

Node 20.9 or newer is required.

```bash
npm install
cp .env.example .env.local   # set ADMIN_EMAIL and ADMIN_PASSWORD
npm run dev
```

Open <http://localhost:3000>.

No database setup is needed locally. Without `DATABASE_URL` the app starts an embedded Postgres (PGlite) in `.data/pglite`, applies the migrations and seeds the catalog on first use. Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set to reach `/admin`. Delete `.data/` to start from a clean database.

## What you can do

**Shopping**

- Browse four categories (Men, Women, Unisex, Accessories) with a featured row plus one section per category.
- Search by name, filter by category, size, colour and price range, and sort four ways.
- Add to cart from a card or the product page; lines split by size.
- Below €40 a €4.90 flat shipping rate applies; the cart, checkout and order history all show the same shipping line and total.

**Accounts**

- Register and log in with email and password. Sessions are stored in the database and referenced by an `httpOnly` cookie.
- `/account`: download your data as JSON, or delete your account.

**Checkout and orders**

- Shipping form (Germany only) and an order summary repeated directly above the **Order with obligation to pay** button.
- Orders are created on the server and priced from the database; the browser only sends product ids, sizes and quantities.
- Signed-in customers see their orders in their account. Guests get a private token, kept in their browser, that lets that browser show the order again.
- Payment is simulated: the card is never charged, transmitted or stored. Demo orders are deleted after 30 days.

**Admin** (`/admin`, admin accounts only)

- Dashboard with order count, order value, customers and recent orders, read from the database.
- Create, edit and delete products; edit the hero, newsletter copy and featured products. Changes are saved to the database and appear on the storefront immediately.

**Legal and trust**

- Legal Notice (`/impressum`), Privacy Policy (`/datenschutz`), Terms (`/agb`), Right of Withdrawal (`/widerruf`) and Shipping & Payment (`/versand-zahlung`), linked from every page.
- A site-wide banner states that this is a demo.
- Every price carries "incl. VAT, plus shipping".
- No analytics, no tracking, no third-party requests while browsing. The only cookie is the login session.

## How it works

```
Browser                          Server (Next.js on Vercel)             Postgres (Neon)
───────                          ──────────────────────────             ───────────────
pages (prerendered HTML)   ◄──── root layout reads catalog  ──────────► products
cart / wishlist / theme          server actions                         homepage_config
  in localStorage                  auth:    login, register, logout ──► users
session cookie (httpOnly) ─────►   admin:   products, homepage     ──► sessions
                                   orders:  place, list             ──► orders
                                   account: delete
                                 /api/auth/session, /api/account/export
```

### Catalog

The root layout (`src/app/layout.tsx`) reads products and homepage copy through `src/lib/data/catalog.ts` and hands them to `StoreProvider`, so every page is rendered on the server with real data. Pages are prerendered and refreshed when an admin saves a change (`revalidatePath` in `src/app/actions/admin.ts`), with a 5-minute timer as a safety net. Prices are stored as integer cents and converted at the edge.

### Authentication

- Passwords are hashed with scrypt (`src/lib/auth/password.ts`); the parameters are stored with each hash.
- A session is a random 256-bit token. The cookie holds the token; the database holds only its SHA-256 (`src/lib/auth/session.ts`). The cookie is `httpOnly`, `Secure`, `SameSite=Lax` and uses the `__Host-` prefix in production.
- Login answers identically for an unknown email and a wrong password, and attempts are rate-limited per client and per account.
- Pages stay static: the browser asks `/api/auth/session` once after load to learn who is signed in.

### Authorization

`/admin` checks the session on the server on every request and redirects anyone who is not an admin. Every admin server action calls `requireAdmin()` again before writing, so calling an action directly without an admin session is refused. All input is parsed with zod schemas in `src/lib/validation.ts`.

### Orders

`placeOrderAction` (`src/app/actions/orders.ts`) validates the form, loads the catalog from the database and builds the order in `src/lib/data/orders.ts`: every line must be an existing product in a size it is sold in, and item prices, shipping and total are computed on the server. Line items are stored as a snapshot, so later catalog edits never change an order. Guest orders are readable only with their token (stored hashed); an order id alone is not enough.

### Browser storage

Only per-browser convenience state lives in `localStorage` (keys prefixed `jaatland_`): cart, wishlist, theme, sort, price filter, guest order tokens, last checkout email and the newsletter field. Reads and writes go through `src/lib/storage.ts`, which tolerates corrupt or unavailable storage. Keys from earlier builds (local accounts, the client-side admin flag, catalog overrides) are deleted on load.

## Reference

### Scripts

| Script | Notes |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` / `npm run start` | Production build and server |
| `npm run lint`, `npm run typecheck` | ESLint, `tsc --noEmit` |
| `npm run test:run` | Unit and database tests, single run |
| `npm run db:generate` | Generate a migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations and seed (needs `DATABASE_URL`) |
| `npm run vercel-build` | `db:migrate` then `next build`; Vercel runs this automatically |

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon; `POSTGRES_URL` is accepted too). Without it, Vercel deploys run in showcase mode; locally the embedded database is used |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account, created or updated by `db:migrate` |
| `STRIPE_SECRET_KEY` | Test-mode key for `POST /api/create-payment-intent` (not yet used by the UI) |

### Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, featured row, per-category sections, newsletter |
| `/product/[id]` | Product detail, with metadata and JSON-LD from the database; unknown ids return 404 |
| `/checkout`, `/orders` | Demo checkout and order history |
| `/sitemap.xml`, `/robots.txt` | Generated from the catalog; private pages are excluded from crawling |
| `/account` | Account details, data export, account deletion (signed-in users) |
| `/admin` | Dashboard, products, homepage editor (admins) |
| `/impressum`, `/datenschutz`, `/agb`, `/widerruf`, `/versand-zahlung` | Legal pages |
| `GET /api/auth/session` | Who is signed in |
| `GET /api/account/export` | The signed-in user's data as JSON |
| `POST /api/create-payment-intent` | Stripe PaymentIntent priced on the server, rate-limited |

### Project layout

```
drizzle/                 SQL migrations (generated; commit them)
scripts/db-migrate.ts    Applies migrations and seeds
src/
  app/                   Routes, server actions (app/actions), API routes
  components/            UI; components/ui holds the shadcn/ui primitives
  db/                    Schema, connection, seed
  hooks/                 Shared search, filter and sort state
  lib/
    auth/                Password hashing, sessions
    data/                Database queries
    validation.ts        zod schemas for all client input
    shipping.ts          Shipping threshold, flat rate, totals
    legal-config.ts      Operator details and legal links
public/products/         Product photos and CREDITS.md
```

### Legal configuration

`src/lib/legal-config.ts` holds the operator's name, address and contact details used by the legal pages. They ship empty on purpose: German law requires the real details of whoever runs the site, so the Legal Notice shows a warning until they are filled in. **Fill them in before deploying publicly.** The legal texts are written for this demo and are not legal advice; have them reviewed before selling anything for real. Keep the Privacy Policy in step with the code whenever data processing changes.

### Images

Product and hero photos are local files in `public/products/`, taken from Unsplash under the Unsplash License; `CREDITS.md` there lists each source. Only local paths and `images.unsplash.com` are accepted, by `next/image` and by the admin form's server-side validation. Only add images you hold the rights to.

### Security headers

`next.config.ts` sends a Content Security Policy, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` on every response. The CSP still allows inline scripts, which Next.js needs unless nonces are used.

## Deploying to Vercel

The project deploys as-is. **Without a database it runs in showcase mode**: the catalog, cart, wishlist and information pages work from the built-in seed data, while sign-in, admin and checkout show a notice that they are not available. Connecting a database switches every feature on; no code change is needed.

For the full shop:

1. Add a Postgres database to the project (Neon integration; choose an EU region). This sets `DATABASE_URL`.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (long and unique) in the project's environment variables.
3. Fill in `src/lib/legal-config.ts`.
4. Deploy. `vercel-build` applies migrations, seeds an empty catalog, creates the admin account, then builds.

## Testing

```bash
npm run test:run
npm run typecheck
npm run lint
```

Unit tests cover order maths, shipping, storage, rate limiting, validation and password hashing. `src/db/seed.test.ts` and `src/lib/data/orders.test.ts` run the real migrations, seed and order logic against an in-memory Postgres. Sign-in, the admin guard, admin saves, checkout and account deletion were verified in a browser during development; there is no committed end-to-end suite yet.

## Known gaps

- **Showcase mode on Vercel** until a database is connected (see [Deploying to Vercel](#deploying-to-vercel)).
- **Operator details are empty** until `src/lib/legal-config.ts` is filled in.
- **Payment is simulated.** Orders are stored with status `pending` and no payment provider is called. Wiring the checkout to Stripe (test mode) with a webhook is the next step.
- **No order emails.** Confirmation emails need an email provider.
- **The newsletter field only saves to the browser.** No address is collected and no email is sent.
- **Rate limits are per server instance** (in memory). A shared store such as Upstash Redis would make them global.
- **No email verification or password reset** yet; both need an email provider.

## License

[MIT](LICENSE)
