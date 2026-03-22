import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';
import { isValidUUID } from '@/lib/validation';
import { getSquareClient } from '@/lib/square';

const VALID_STATUSES = ['active', 'paused', 'cancelled'];

export async function PATCH(
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

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status is a string and is valid
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify ownership — explicitly require non-null user_id to prevent guest IDOR
    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('user_id, square_subscription_id')
      .eq('id', id)
      .single();

    if (fetchError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Block modifications to guest subscriptions (null user_id) via this endpoint
    if (!sub.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (sub.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Sync status change to Square Subscriptions API
    if (sub.square_subscription_id) {
      try {
        const sq = getSquareClient();
        if (status === 'paused') {
          await sq.subscriptions.pause({ subscriptionId: sub.square_subscription_id });
        } else if (status === 'cancelled') {
          await sq.subscriptions.cancel({ subscriptionId: sub.square_subscription_id });
        } else if (status === 'active') {
          await sq.subscriptions.resume({ subscriptionId: sub.square_subscription_id });
        }
      } catch (sqErr) {
        console.error('[subscriptions/status] Square sync failed:', sqErr instanceof Error ? sqErr.message : sqErr);
        // Continue with DB update even if Square fails
      }
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

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[subscriptions/status] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
