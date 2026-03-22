import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { isValidUUID } from '@/lib/validation';
import { sendEmail, orderStatusEmail } from '@/lib/email';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

// Allowed status transitions — prevents invalid state changes
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['preparing', 'cancelled'],
  'preparing': ['out-for-delivery', 'cancelled'],
  'out-for-delivery': ['delivered', 'cancelled'],
  'delivered': [],        // terminal state
  'cancelled': [],        // terminal state
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch current order to validate transition
    const { data: order, error: fetchError } = await supabase!
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status as string;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from "${currentStatus}" to "${status}"` },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase!
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    await logAdminAction({
      adminId: user!.id,
      action: 'update',
      table: 'orders',
      recordId: id,
      details: { from: currentStatus, to: status },
    });

    // Send status update email to customer (fire-and-forget)
    const { data: fullOrder } = await supabase!
      .from('orders')
      .select('customer_name, customer_email, delivery_date')
      .eq('id', id)
      .single();

    if (fullOrder?.customer_email) {
      const emailData = orderStatusEmail({
        id,
        customerName: fullOrder.customer_name,
        status,
        deliveryDate: fullOrder.delivery_date,
      });
      sendEmail({ to: fullOrder.customer_email, ...emailData }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/orders/status] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
