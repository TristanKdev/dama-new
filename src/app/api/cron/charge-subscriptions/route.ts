import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { getSquareClient, getLocationId } from '@/lib/square';
import { sendEmail } from '@/lib/email';

// This endpoint is called by Vercel Cron (or external scheduler).
// Protect with a secret key to prevent unauthorized access.
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = createServiceRoleClient();

    // Get today's day name (e.g., "Tuesday")
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
    });

    // Find active subscriptions that deliver on today's day
    const { data: subscriptions, error } = await db
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .eq('delivery_day', dayName);

    if (error || !subscriptions) {
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    const results: { id: string; status: string; error?: string }[] = [];

    for (const sub of subscriptions) {
      // Skip biweekly subscriptions that were charged last week
      if (sub.frequency === 'biweekly' && sub.last_charged_at) {
        const lastCharged = new Date(sub.last_charged_at);
        const daysSinceCharge = (now.getTime() - lastCharged.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCharge < 12) {
          results.push({ id: sub.id, status: 'skipped', error: 'Biweekly: not due yet' });
          continue;
        }
      }

      // Validate price before charging
      const pricePerDelivery = sub.price_per_delivery || 35;
      if (pricePerDelivery < 5 || pricePerDelivery > 200) {
        results.push({ id: sub.id, status: 'error', error: `Invalid price: $${pricePerDelivery}` });
        continue;
      }

      // Charge using Square card-on-file if available
      if (sub.square_customer_id && sub.square_card_id) {
        try {
          const squareClient = getSquareClient();
          const amountCents = BigInt(Math.round(pricePerDelivery * 100));
          // Idempotency key includes date to prevent double-charge on cron re-runs
          const etDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(now);
          const idempotencyKey = `sub-${sub.id}-${etDate}`;

          const paymentResponse = await squareClient.payments.create({
            sourceId: sub.square_card_id,
            customerId: sub.square_customer_id,
            idempotencyKey,
            amountMoney: {
              amount: amountCents,
              currency: 'USD',
            },
            locationId: getLocationId(),
            note: `Subscription ${sub.plan_name} — ${sub.customer_name}`,
            referenceId: sub.id,
          });

          if (paymentResponse.payment?.status === 'COMPLETED') {
            // Payment succeeded — now mark as charged and update next delivery
            const nextDelivery = new Date(etDate + 'T12:00:00');
            nextDelivery.setDate(nextDelivery.getDate() + (sub.frequency === 'biweekly' ? 14 : 7));
            const nextDeliveryStr = `${nextDelivery.getFullYear()}-${String(nextDelivery.getMonth() + 1).padStart(2, '0')}-${String(nextDelivery.getDate()).padStart(2, '0')}`;

            const { error: updateErr } = await db.from('subscriptions').update({
              last_charged_at: now.toISOString(),
              next_delivery_date: nextDeliveryStr,
            }).eq('id', sub.id);

            if (updateErr) {
              // Payment succeeded but DB update failed — log for manual reconciliation
              console.error(`[cron/charge] Payment ${paymentResponse.payment.id} succeeded but DB update failed for sub ${sub.id}:`, updateErr);
            }

            // Send receipt email (fire-and-forget)
            if (sub.customer_email) {
              sendEmail({
                to: sub.customer_email,
                subject: `Subscription Charged — ${sub.plan_name}`,
                html: subscriptionChargeEmail(sub.customer_name, sub.plan_name, pricePerDelivery, nextDeliveryStr),
              }).catch((emailErr) => console.error('[cron/charge] Email failed:', emailErr));
            }

            results.push({ id: sub.id, status: 'charged' });
          } else {
            results.push({ id: sub.id, status: 'payment_failed', error: `Payment status: ${paymentResponse.payment?.status}` });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Payment failed';
          console.error(`[cron/charge] Error charging sub ${sub.id}:`, message);
          results.push({ id: sub.id, status: 'error', error: message });

          // Notify customer of failed charge
          if (sub.customer_email) {
            sendEmail({
              to: sub.customer_email,
              subject: 'Subscription Payment Failed — DAM:A',
              html: paymentFailedEmail(sub.customer_name, sub.plan_name),
            }).catch((emailErr) => console.error('[cron/charge] Failed email failed:', emailErr));
          }
        }
      } else {
        // No card on file — skip but log
        results.push({ id: sub.id, status: 'no_card', error: 'No Square card on file' });
      }
    }

    return NextResponse.json({
      processed: results.length,
      dayName,
      results,
    });
  } catch (err: unknown) {
    console.error('[cron/charge-subscriptions] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function subscriptionChargeEmail(name: string, plan: string, amount: number, nextDate: string): string {
  const formattedDate = new Date(nextDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
      <h1 style="color:#2d2d2d;font-size:24px">Subscription Charged</h1>
      <p style="color:#666">Hi ${esc(name)}, your ${esc(plan)} subscription has been charged.</p>
      <div style="background:#f9f9f6;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#2d2d2d;font-weight:600">$${amount.toFixed(2)}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#888">Next delivery: ${formattedDate}</p>
      </div>
      <p style="color:#888;font-size:12px;margin-top:24px">DAM:A — Korean Banchan, Delivered</p>
    </div>
  `;
}

function paymentFailedEmail(name: string, plan: string): string {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
      <h1 style="color:#2d2d2d;font-size:24px">Payment Failed</h1>
      <p style="color:#666">Hi ${esc(name)}, we weren't able to charge your card for your ${esc(plan)} subscription.</p>
      <p style="color:#666">Please update your payment method to keep your subscription active. If you need help, reply to this email or contact us.</p>
      <p style="color:#888;font-size:12px;margin-top:24px">DAM:A — Korean Banchan, Delivered</p>
    </div>
  `;
}
