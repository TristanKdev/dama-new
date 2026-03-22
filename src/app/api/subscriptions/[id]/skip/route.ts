import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';
import { isValidUUID } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 });
    }

    // Verify ownership
    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('user_id, status, frequency, delivery_day, next_delivery_date')
      .eq('id', id)
      .single();

    if (fetchError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (!sub.user_id || sub.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (sub.status !== 'active') {
      return NextResponse.json({ error: 'Can only skip deliveries for active subscriptions' }, { status: 400 });
    }

    if (!sub.next_delivery_date) {
      return NextResponse.json({ error: 'No upcoming delivery to skip' }, { status: 400 });
    }

    // Advance next_delivery_date by 1 week (weekly) or 2 weeks (biweekly)
    const currentNext = new Date(sub.next_delivery_date + 'T12:00:00');
    const skipDays = sub.frequency === 'biweekly' ? 14 : 7;
    currentNext.setDate(currentNext.getDate() + skipDays);
    const newNextDate = `${currentNext.getFullYear()}-${String(currentNext.getMonth() + 1).padStart(2, '0')}-${String(currentNext.getDate()).padStart(2, '0')}`;

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        next_delivery_date: newNextDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to skip delivery' }, { status: 500 });
    }

    return NextResponse.json({ success: true, nextDeliveryDate: newNextDate });
  } catch (err: unknown) {
    console.error('[subscriptions/skip] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to skip delivery' },
      { status: 500 }
    );
  }
}
