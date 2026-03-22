import { NextResponse } from 'next/server';
import { getSquareClient, getLocationId } from '@/lib/square';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(`payment:${ip}`, RATE_LIMITS.payment);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sourceId, amount, customerEmail, customerName } = body;

    // Validate sourceId (payment token from Square Web Payments SDK)
    if (!sourceId || typeof sourceId !== 'string') {
      return NextResponse.json(
        { error: 'Missing payment token' },
        { status: 400 }
      );
    }

    // Validate amount (max $1,000 for a banchan delivery order)
    if (typeof amount !== 'number' || amount <= 0 || amount > 1000) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Validate optional idempotency key from client (for retry safety)
    const clientIdempotencyKey = typeof body.idempotencyKey === 'string' && body.idempotencyKey.length > 0
      ? body.idempotencyKey
      : null;

    const squareClient = getSquareClient();
    const locationId = getLocationId();
    const amountCents = BigInt(Math.round(amount * 100));
    // Use client-provided key if available (prevents duplicate charges on retries),
    // otherwise fall back to a random UUID (single-attempt scenario)
    const idempotencyKey = clientIdempotencyKey || crypto.randomUUID();

    const response = await Promise.race([
      squareClient.payments.create({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: amountCents,
          currency: 'USD',
        },
        locationId,
        autocomplete: true,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Payment request timed out')), 30000)
      ),
    ]);

    const payment = response.payment;

    if (!payment || payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment was not completed' },
        { status: 400 }
      );
    }

    // Save Square customer for future purchases (fire-and-forget)
    let customerId: string | undefined;
    if (customerEmail) {
      try {
        // Search for existing customer
        const searchRes = await squareClient.customers.search({
          query: {
            filter: {
              emailAddress: { exact: customerEmail.toLowerCase().trim() },
            },
          },
        });

        if (searchRes.customers && searchRes.customers.length > 0) {
          customerId = searchRes.customers[0].id;
        } else {
          // Create new customer
          const createRes = await squareClient.customers.create({
            emailAddress: customerEmail.toLowerCase().trim(),
            givenName: customerName || undefined,
            idempotencyKey: `customer-${customerEmail.toLowerCase().trim()}`,
          });
          customerId = createRes.customer?.id;
        }
      } catch {
        // Don't fail payment if customer saving fails
      }
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      customerId,
    });
  } catch (err: unknown) {
    console.error('[payments/create] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
