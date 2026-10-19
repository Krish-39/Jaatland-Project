import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { DEFAULT_PRODUCTS } from '@/lib/mock-data';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const MAX_LINES = 50;
const MAX_QUANTITY = 99;

interface RequestedLine {
  id: string;
  qty: number;
}

function parseLines(value: unknown): RequestedLine[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_LINES) {
    return null;
  }

  const lines: RequestedLine[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return null;

    const { id, qty } = entry as { id?: unknown; qty?: unknown };
    if (
      typeof id !== 'string' ||
      typeof qty !== 'number' ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > MAX_QUANTITY
    ) {
      return null;
    }

    lines.push({ id, qty });
  }

  return lines;
}

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.error('Stripe is not configured - no key found');
      return NextResponse.json(
        { error: 'Payments are not configured' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const lines = parseLines((body as { items?: unknown } | null)?.items);
    if (!lines) {
      return NextResponse.json(
        { error: 'items must be a non-empty list of { id, qty }' },
        { status: 400 }
      );
    }

    // Price the order from the server-side catalog. Never trust an amount (or
    // price) supplied by the client. In a real app this lookup would hit the
    // product database; the demo catalog is the source of truth here.
    const catalog = new Map(DEFAULT_PRODUCTS.map((product) => [product.id, product]));
    if (lines.some((line) => !catalog.has(line.id))) {
      return NextResponse.json(
        { error: 'One or more products are unavailable' },
        { status: 400 }
      );
    }

    const amount = lines.reduce((sum, line) => {
      const product = catalog.get(line.id);
      return product ? sum + product.price * line.qty : sum;
    }, 0);
    const amountInCents = Math.round(amount * 100);

    if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    // Log details server-side, but never leak provider/stack details to the client.
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
