import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sendEmail, orderStatusEmail } from '@/lib/email';
import { isValidUUID } from '@/lib/validation';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

// Allowed status transitions — must match single-order route
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['preparing', 'cancelled'],
  'preparing': ['out-for-delivery', 'cancelled'],
  'out-for-delivery': ['delivered', 'cancelled'],
  'delivered': [],
  'cancelled': [],
};

export async function POST(request: Request) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const body = await request.json();
    const { orderIds, status } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'No orders selected' }, { status: 400 });
    }

    if (orderIds.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 orders per batch' }, { status: 400 });
    }

    // Validate all IDs are valid UUIDs
    if (orderIds.some((id: unknown) => typeof id !== 'string' || !isValidUUID(id))) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch current orders to get customer emails and validate transitions
    const { data: orders } = await supabase!
      .from('orders')
      .select('id, customer_name, customer_email, delivery_date, status')
      .in('id', orderIds);

    // Validate transitions — only update orders with valid transitions
    const validOrderIds: string[] = [];
    const skippedOrders: string[] = [];
    for (const order of (orders ?? []) as { id: string; status: string }[]) {
      const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
      if (allowed.includes(status)) {
        validOrderIds.push(order.id);
      } else {
        skippedOrders.push(order.id);
      }
    }

    if (validOrderIds.length === 0) {
      return NextResponse.json({
        error: `No orders can transition to "${status}" from their current status`,
        skipped: skippedOrders.length,
      }, { status: 400 });
    }

    // Update only valid orders
    const { error: updateError } = await supabase!
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', validOrderIds);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update orders' }, { status: 500 });
    }

    // Log and send emails only for successfully updated orders
    const validIdSet = new Set(validOrderIds);
    for (const order of ((orders ?? []) as { id: string; customer_name: string; customer_email: string; delivery_date: string; status: string }[]).filter(o => validIdSet.has(o.id))) {
      await logAdminAction({
        adminId: user!.id,
        action: 'update',
        table: 'orders',
        recordId: order.id,
        details: { from: order.status, to: status, bulk: true },
      });

      if (order.customer_email) {
        const emailData = orderStatusEmail({
          id: order.id,
          customerName: order.customer_name,
          status,
          deliveryDate: order.delivery_date,
        });
        sendEmail({ to: order.customer_email, ...emailData }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      updated: validOrderIds.length,
      skipped: skippedOrders.length,
    });
  } catch (err: unknown) {
    console.error('[admin/orders/bulk-status] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
