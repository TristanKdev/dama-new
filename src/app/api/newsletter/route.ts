import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { isValidEmail } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { sendNotification, newsletterNotificationEmail } from '@/lib/email';
import { syncLeadToSquare } from '@/lib/square';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`newsletter:${ip}`, RATE_LIMITS.form);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const { email } = await request.json();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    const db = createServiceRoleClient();
    const { error } = await db
      .from('newsletter_subscribers')
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' });

    if (error) {
      return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 });
    }

    // Notify admin
    const notif = newsletterNotificationEmail(email.toLowerCase().trim());
    sendNotification(notif.subject, notif.html);

    // Sync lead to Square (fire-and-forget)
    syncLeadToSquare({ email: email.toLowerCase().trim(), note: 'Newsletter signup' }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[newsletter] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
