import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { sendEmail, escapeHtml } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = createServiceRoleClient();

    // Get tomorrow's date in ET (business timezone)
    const etFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' });
    const todayET = new Date(etFormatter.format(new Date()) + 'T12:00:00');
    todayET.setDate(todayET.getDate() + 1);
    const tomorrowStr = `${todayET.getFullYear()}-${String(todayET.getMonth() + 1).padStart(2, '0')}-${String(todayET.getDate()).padStart(2, '0')}`;

    // Find orders delivering tomorrow that aren't cancelled
    const { data: orders, error } = await db
      .from('orders')
      .select('id, customer_name, customer_email, delivery_date, delivery_method, delivery_address, total, status')
      .eq('delivery_date', tomorrowStr)
      .neq('status', 'cancelled')
      .neq('status', 'delivered');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    let sent = 0;
    for (const order of (orders ?? []) as { id: string; customer_name: string; customer_email: string; delivery_date: string; delivery_method: string; delivery_address: string | null; total: number }[]) {
      if (!order.customer_email) continue;

      const isPickup = order.delivery_method === 'pickup';
      const formattedDate = new Date(order.delivery_date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#3D3830">
          <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:20px;font-weight:700;color:#2F5233;letter-spacing:1px">DAM:A</span>
          </div>
          <h1 style="font-size:22px;margin:0 0 8px">${isPickup ? 'Pickup Reminder' : 'Delivery Tomorrow!'}</h1>
          <p style="color:#666;margin:0 0 16px;font-size:14px">Hi ${escapeHtml(order.customer_name)}, just a reminder that your banchan ${isPickup ? 'is ready for pickup' : 'arrives'} tomorrow.</p>
          <div style="background:#f9f8f5;border-radius:8px;padding:16px">
            <p style="margin:0;font-size:14px;font-weight:600;color:#3D3830">${formattedDate}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#888">${isPickup ? 'Pickup at DAM:A Kitchen' : `Delivery to ${escapeHtml(order.delivery_address || 'your building')}`}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#888">${isPickup ? '11:00 AM – 6:00 PM' : 'By 12:00 PM'}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#888">Order #${order.id.slice(0, 8).toUpperCase()} &middot; $${order.total.toFixed(2)}</p>
          </div>
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e8e4dc;text-align:center">
            <p style="color:#999;font-size:11px;margin:0">DAM:A — Korean Banchan, Delivered</p>
          </div>
        </div>
      `;

      const success = await sendEmail({
        to: order.customer_email,
        subject: `${isPickup ? 'Pickup' : 'Delivery'} Tomorrow — Order ${order.id.slice(0, 8).toUpperCase()}`,
        html,
      });

      if (success) sent++;
    }

    return NextResponse.json({
      date: tomorrowStr,
      total: orders?.length ?? 0,
      sent,
    });
  } catch (err: unknown) {
    console.error('[cron/delivery-reminders] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
