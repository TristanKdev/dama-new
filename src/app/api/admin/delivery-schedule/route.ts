import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';

export async function GET() {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const [scheduleResult, blackoutResult] = await Promise.all([
    supabase!
      .from('delivery_schedule')
      .select('*')
      .order('day_of_week', { ascending: true }),
    supabase!
      .from('delivery_blackout_dates')
      .select('*')
      .gte('blackout_date', new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date()))
      .order('blackout_date', { ascending: true }),
  ]);

  if (scheduleResult.error) {
    return NextResponse.json({ error: 'Failed to load schedule' }, { status: 500 });
  }

  return NextResponse.json({
    schedule: scheduleResult.data,
    blackoutDates: blackoutResult.data ?? [],
  });
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const body = await request.json();
    const { id, active, cutoff_hours_before } = body;

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof active === 'boolean') updates.active = active;
    if (typeof cutoff_hours_before === 'number' && cutoff_hours_before > 0 && cutoff_hours_before <= 168) {
      updates.cutoff_hours_before = cutoff_hours_before;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase!
      .from('delivery_schedule')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'update', table: 'delivery_schedule', recordId: id, details: updates });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/delivery-schedule] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
