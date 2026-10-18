# Jaatland

Jaatland is a clothing e-commerce storefront prototype built with Next.js, React, and TypeScript.

## Features

- Product catalogue and product detail pages with size selection
- Size-aware shopping cart with browser-side state
- Checkout page and a server-side Stripe PaymentIntent endpoint (`/api/create-payment-intent`)
- Order-history and admin routes

## Tech stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Stripe for payment-intent creation

## Run locally

You’ll need Node.js and npm. From the repository root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stripe test configuration

To use the payment-intent endpoint, create a `.env.local` file in the repository root and add a Stripe test secret:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
```

Use a test key for development. Never commit `.env.local` or a real secret key. The endpoint creates EUR card payment intents; it is not, by itself, a complete production payment or order-management system.

## Checks

```bash
npm run test:run
npm run build
```

This repository is a prototype. Review authentication, order persistence, and payment handling before any production use.
