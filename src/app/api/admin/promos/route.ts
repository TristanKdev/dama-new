import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sanitizeText } from '@/lib/validation';

export async function GET() {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { data, error: queryError } = await supabase!
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load promo codes' }, { status: 500 });
  }

  return NextResponse.json({ promos: data });
}

export async function POST(request: Request) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const body = await request.json();
    const { code, discount_type, discount_value, min_order_amount, max_uses, expires_at } = body;

    if (!code || !discount_type || discount_value == null) {
      return NextResponse.json(
        { error: 'Code, discount type, and discount value are required.' },
        { status: 400 }
      );
    }

    if (!['percent', 'fixed'].includes(discount_type)) {
      return NextResponse.json({ error: 'Invalid discount type.' }, { status: 400 });
    }

    if (isNaN(Number(discount_value)) || Number(discount_value) <= 0) {
      return NextResponse.json({ error: 'Discount value must be a positive number.' }, { status: 400 });
    }

    if (discount_type === 'percent' && Number(discount_value) > 100) {
      return NextResponse.json({ error: 'Percent discount cannot exceed 100.' }, { status: 400 });
    }

    const { data, error: insertError } = await supabase!
      .from('promo_codes')
      .insert({
        code: sanitizeText(code, 50).toUpperCase().trim(),
        discount_type,
        discount_value: Number(discount_value),
        min_order_amount: Number(min_order_amount) || 0,
        max_uses: max_uses ? Number(max_uses) : null,
        current_uses: 0,
        expires_at: expires_at || null,
        active: true,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'A promo code with this code already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'create', table: 'promo_codes', recordId: data.id });

    return NextResponse.json({ promo: data });
  } catch (err: unknown) {
    console.error('[admin/promos] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
