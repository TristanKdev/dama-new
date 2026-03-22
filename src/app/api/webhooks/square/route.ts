import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { WebhooksHelper } from 'square';

const STALE_EVENT_MS = 3 * 60 * 60 * 1000; // 3 hours — must exceed Square's retry window

export async function POST(request: Request) {
  try {
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const notificationUrl = process.env.SQUARE_WEBHOOK_URL;

    if (!signatureKey || !notificationUrl) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature') || '';

    const isValid = await WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey,
      notificationUrl,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const event = JSON.parse(body);
    const eventType = event.type as string;

    // Replay prevention: reject stale events (older than 10 minutes)
    const eventTimestamp = event.created_at;
    if (eventTimestamp) {
      const eventTime = new Date(eventTimestamp).getTime();
      if (!isNaN(eventTime) && Date.now() - eventTime > STALE_EVENT_MS) {
        return NextResponse.json({ received: true }); // Silently ignore stale events
      }
    }

    const db = createServiceRoleClient();

    // Replay prevention: deduplicate by event ID (persisted in DB)
    // Uses INSERT with conflict handling to avoid TOCTOU race between check and insert
    const eventId = event.event_id as string | undefined;
    if (eventId) {
      const { error: insertError } = await db
        .from('webhook_processed_events')
        .insert({ event_id: eventId });

      // Unique constraint violation (23505) means already processed
      if (insertError?.code === '23505') {
        return NextResponse.json({ received: true });
      }
      // Other insert errors — log but continue processing (don't lose the event)
      if (insertError) {
        console.error('[webhook] Failed to record event ID:', insertError);
      }
    }

    // Only handle payment and refund events
    if (!eventType?.startsWith('payment.') && !eventType?.startsWith('refund.')) {
      return NextResponse.json({ received: true });
    }

    // Extract payment ID from the appropriate event structure
    let paymentId: string | undefined;
    let paymentStatus: string | null = null;

    if (eventType === 'payment.completed') {
      paymentId = event.data?.object?.payment?.id;
      paymentStatus = 'completed';
    } else if (eventType === 'payment.failed') {
      paymentId = event.data?.object?.payment?.id;
      paymentStatus = 'failed';
    } else if (eventType === 'payment.canceled') {
      paymentId = event.data?.object?.payment?.id;
      paymentStatus = 'failed';
    } else if (eventType === 'refund.created') {
      // Refund initiated but may still be PENDING — don't mark as fully refunded yet
      paymentId = event.data?.object?.refund?.payment_id;
      const refundStatus = event.data?.object?.refund?.status;
      paymentStatus = refundStatus === 'COMPLETED' ? 'refunded' : 'refund_pending';
    } else if (eventType === 'refund.updated') {
      paymentId = event.data?.object?.refund?.payment_id;
      const refundStatus = event.data?.object?.refund?.status;
      paymentStatus = refundStatus === 'COMPLETED' ? 'refunded' : refundStatus === 'FAILED' ? 'completed' : 'refund_pending';
    }

    if (!paymentId || !paymentStatus) {
      return NextResponse.json({ received: true });
    }

    // Validate payment status transitions to prevent corrupted state
    const VALID_TRANSITIONS: Record<string, string[]> = {
      pending: ['completed', 'failed'],
      completed: ['refunded', 'refund_pending'],
      failed: ['completed'],  // Retry can succeed
      refund_pending: ['refunded', 'completed'],  // Refund can complete or fail
      refunded: [],  // Terminal state
    };

    // Fetch current payment status to validate transition
    const { data: currentOrder } = await db
      .from('orders')
      .select('payment_status')
      .eq('payment_reference', paymentId)
      .maybeSingle();

    if (currentOrder) {
      const currentStatus = currentOrder.payment_status as string;
      const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
      if (!allowed.includes(paymentStatus)) {
        console.warn(`[webhook] Blocked invalid transition: ${currentStatus} → ${paymentStatus} for payment ${paymentId}`);
        return NextResponse.json({ received: true }); // Acknowledge but don't update
      }
    }

    const { error: updateError } = await db
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('payment_reference', paymentId);

    if (updateError) {
      console.error('[webhook] DB update failed:', updateError);
      // Return 500 so Square retries for transient DB errors
      return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('[webhook] Unexpected error:', err instanceof Error ? err.message : err);
    // Return 500 for unexpected errors so Square retries
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
