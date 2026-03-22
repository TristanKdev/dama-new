import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { sanitizeText } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`promo:${ip}`, RATE_LIMITS.publicRead);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const { code, orderTotal } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Promo code required.' }, { status: 400 });
    }

    const sanitizedCode = sanitizeText(code.toUpperCase().trim(), 50);
    const db = createServiceRoleClient();

    const { data: promo, error } = await db
      .from('promo_codes')
      .select('*')
      .eq('code', sanitizedCode)
      .eq('active', true)
      .maybeSingle();

    if (error || !promo) {
      return NextResponse.json({ error: 'Invalid promo code.' }, { status: 400 });
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This promo code has expired.' }, { status: 400 });
    }

    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ error: 'This promo code has been fully redeemed.' }, { status: 400 });
    }

    if (typeof orderTotal === 'number' && promo.min_order_amount > 0 && orderTotal < promo.min_order_amount) {
      return NextResponse.json({
        error: `Minimum order of $${promo.min_order_amount} required for this code.`,
      }, { status: 400 });
    }

    let discount = 0;
    if (promo.discount_type === 'percent') {
      discount = typeof orderTotal === 'number' ? Math.round(orderTotal * (promo.discount_value / 100) * 100) / 100 : 0;
    } else {
      discount = promo.discount_value;
    }
    // Cap discount to order total to prevent misleading negative totals in UI
    if (typeof orderTotal === 'number' && discount > orderTotal) {
      discount = orderTotal;
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      discount,
    });
  } catch (err: unknown) {
    console.error('[promo/validate] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
