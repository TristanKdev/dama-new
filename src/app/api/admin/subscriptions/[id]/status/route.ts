import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { isValidUUID } from '@/lib/validation';

const VALID_STATUSES = ['active', 'paused', 'cancelled'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 });
    }
    const { status } = await request.json();

    if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'paused') {
      updates.paused_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    } else if (status === 'active') {
      updates.paused_at = null;
    }

    const { error: updateError } = await supabase!
      .from('subscriptions')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'update', table: 'subscriptions', recordId: id, details: { status } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/subscriptions/status] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
