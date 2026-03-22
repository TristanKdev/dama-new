import { NextResponse } from 'next/server';
import { createSubscription, calculateNextDeliveryDate } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase';
import { isValidEmail, isValidPhone, isValidFrequency, isValidDeliveryDay, sanitizeText } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail, subscriptionConfirmationEmail } from '@/lib/email';
import { getSquareClient, getLocationId } from '@/lib/square';

// Square subscription plan variation IDs
const PLAN_VARIATION_IDS: Record<string, string> = {
  weekly: 'YCC2BE22FIWKXM6S4NLJS7WY',
  biweekly: 'ZE6CK6JLF6ND3ERYGMQJJTTB',
};

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(`subscriptions:${ip}`, RATE_LIMITS.form);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      customerName, customerEmail, customerPhone,
      deliveryDay, deliveryAddress, frequency,
      userId, squareCustomerId, squareCardId,
    } = body;

    if (!customerName || !customerEmail || !deliveryDay || !deliveryAddress || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!isValidFrequency(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be weekly or biweekly.' },
        { status: 400 }
      );
    }

    if (!isValidDeliveryDay(deliveryDay)) {
      return NextResponse.json(
        { error: 'Invalid delivery day. Must be Tuesday, Thursday, or Saturday.' },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (customerPhone && !isValidPhone(customerPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Validate Square IDs (required for Square subscription)
    const validSquareCustomerId = typeof squareCustomerId === 'string' && squareCustomerId.length > 0
      ? squareCustomerId : undefined;
    const validSquareCardId = typeof squareCardId === 'string' && squareCardId.length > 0
      ? squareCardId : undefined;

    // Create Square subscription for automatic recurring billing
    let squareSubscriptionId: string | undefined;
    if (validSquareCustomerId && validSquareCardId) {
      try {
        const sq = getSquareClient();
        const planVariationId = PLAN_VARIATION_IDS[frequency];
        const nextDate = calculateNextDeliveryDate(deliveryDay);

        const sqSub = await sq.subscriptions.create({
          idempotencyKey: `sub-${validSquareCustomerId}-${Date.now()}`,
          locationId: getLocationId(),
          planVariationId,
          customerId: validSquareCustomerId,
          cardId: validSquareCardId,
          startDate: nextDate,
          timezone: 'America/New_York',
          source: { name: 'DAMA Website' },
        });

        squareSubscriptionId = sqSub.subscription?.id;
      } catch (sqErr) {
        console.error('[subscriptions] Square subscription creation failed:', sqErr instanceof Error ? sqErr.message : sqErr);
        // Continue — we'll store in DB and fall back to manual charging via cron
      }
    }

    const subscriptionId = await createSubscription({
      customerName: sanitizeText(customerName, 200),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone ? sanitizeText(customerPhone, 30) : undefined,
      frequency,
      deliveryDay,
      deliveryAddress: sanitizeText(deliveryAddress, 500),
      userId: userId || undefined,
      squareCustomerId: validSquareCustomerId,
      squareCardId: validSquareCardId,
      squareSubscriptionId,
    }, serviceClient);

    // Send confirmation email (fire-and-forget)
    const nextDate = calculateNextDeliveryDate(deliveryDay);
    const emailData = subscriptionConfirmationEmail({
      customerName: sanitizeText(customerName, 200),
      planName: 'Weekly Banchan Box',
      frequency,
      deliveryDay,
      nextDeliveryDate: nextDate,
    });
    sendEmail({ to: customerEmail.toLowerCase().trim(), ...emailData }).catch(() => {});

    return NextResponse.json({ subscriptionId });
  } catch (err: unknown) {
    console.error('[subscriptions] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
