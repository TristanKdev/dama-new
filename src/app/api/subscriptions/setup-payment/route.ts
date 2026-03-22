import { NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { isValidEmail, sanitizeText } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(`sub-setup:${ip}`, RATE_LIMITS.payment);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sourceId, customerEmail, customerName } = body;

    // Validate sourceId (card nonce from Square Web Payments SDK)
    if (!sourceId || typeof sourceId !== 'string') {
      return NextResponse.json(
        { error: 'Missing payment source token' },
        { status: 400 }
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const squareClient = getSquareClient();
    const email = customerEmail.toLowerCase().trim();
    const name = sanitizeText(customerName, 200);

    // 1. Find or create a Square customer
    let customerId: string | undefined;

    const searchRes = await squareClient.customers.search({
      query: {
        filter: {
          emailAddress: { exact: email },
        },
      },
    });

    if (searchRes.customers && searchRes.customers.length > 0) {
      customerId = searchRes.customers[0].id;
    } else {
      const createRes = await squareClient.customers.create({
        emailAddress: email,
        givenName: name,
        idempotencyKey: `sub-customer-${email}`,
      });
      customerId = createRes.customer?.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Failed to create customer record' },
        { status: 500 }
      );
    }

    // 2. Create a card-on-file using the card nonce + customer ID
    const cardRes = await squareClient.cards.create({
      sourceId,
      idempotencyKey: `sub-card-${customerId}-${Date.now()}`,
      card: {
        customerId,
      },
    });

    const cardId = cardRes.card?.id;

    if (!cardId) {
      return NextResponse.json(
        { error: 'Failed to save card on file' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customerId, cardId });
  } catch (err: unknown) {
    console.error('[subscriptions/setup-payment] Error:', err instanceof Error ? err.message : err);
    const message = err instanceof Error ? err.message : 'Payment setup failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
