import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sanitizeText, isValidUUID } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const body = await request.json();
    const { blackout_date, reason } = body;

    if (!blackout_date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Validate date format and ensure it's in the future
    const dateObj = new Date(blackout_date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase!
      .from('delivery_blackout_dates')
      .insert({
        blackout_date,
        reason: reason ? sanitizeText(reason, 500) : null,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This date is already blacked out' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'Failed to add blackout date' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'create', table: 'delivery_blackout_dates', recordId: data.id, details: { blackout_date } });

    return NextResponse.json({ blackoutDate: data });
  } catch (err: unknown) {
    console.error('[admin/delivery-schedule/blackout] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { supabase, user, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || !isValidUUID(id)) {
    return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
  }

  const { error: deleteError } = await supabase!
    .from('delivery_blackout_dates')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete blackout date' }, { status: 500 });
  }

  await logAdminAction({ adminId: user!.id, action: 'delete', table: 'delivery_blackout_dates', recordId: id });

  return NextResponse.json({ success: true });
}
