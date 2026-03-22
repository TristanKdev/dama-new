import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { getSquareClient } from '@/lib/square';
import { logAdminAction } from '@/lib/audit';
import { isValidUUID } from '@/lib/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Get order with payment reference
    const { data: order, error: orderError } = await supabase!
      .from('orders')
      .select('id, payment_reference, payment_status, total')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.payment_reference) {
      return NextResponse.json({ error: 'No payment reference found for this order' }, { status: 400 });
    }

    if (order.payment_status === 'refunded') {
      return NextResponse.json({ error: 'Order already refunded' }, { status: 400 });
    }

    // Issue refund via Square
    const squareClient = getSquareClient();
    const amountCents = BigInt(Math.round(order.total * 100));

    const refundResponse = await Promise.race([
      squareClient.refunds.refundPayment({
        idempotencyKey: `refund-${id}`,
        paymentId: order.payment_reference,
        amountMoney: {
          amount: amountCents,
          currency: 'USD',
        },
        reason: 'Admin-initiated refund',
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Refund request timed out')), 30000)
      ),
    ]);

    const refund = refundResponse.refund;

    if (!refund || (refund.status !== 'COMPLETED' && refund.status !== 'PENDING')) {
      return NextResponse.json(
        { error: `Refund failed with status: ${refund?.status || 'unknown'}` },
        { status: 400 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase!
      .from('orders')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      // Refund succeeded on Square but DB update failed — log for manual reconciliation
      console.error(`[refund] Square refund ${refund?.id} succeeded but DB update failed for order ${id}:`, updateError);

      await logAdminAction({
        adminId: user!.id,
        action: 'update',
        table: 'orders',
        recordId: id,
        details: { action: 'refund', refundId: refund?.id, amount: order.total, dbUpdateFailed: true },
      });

      return NextResponse.json({
        success: true,
        refundId: refund?.id,
        status: refund?.status,
        warning: 'Refund processed but order status update failed. Please update the order manually.',
      });
    }

    // Audit log
    await logAdminAction({
      adminId: user!.id,
      action: 'update',
      table: 'orders',
      recordId: id,
      details: { action: 'refund', refundId: refund?.id, amount: order.total },
    });

    return NextResponse.json({
      success: true,
      refundId: refund?.id,
      status: refund?.status,
    });
  } catch (err: unknown) {
    console.error('[admin/orders/refund] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Refund processing failed' }, { status: 500 });
  }
}
