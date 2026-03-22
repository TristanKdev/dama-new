import { NextResponse } from 'next/server';
import { getOrdersByEmail } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase';
import { isValidEmail } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit to prevent email enumeration
    const ip = getClientIp(request);
    const rl = checkRateLimit(`order-lookup:${ip}`, RATE_LIMITS.lookup);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400 }
      );
    }

    // Use service role client since RLS no longer allows anonymous reads
    const serviceClient = createServiceRoleClient();
    const orders = await getOrdersByEmail(email, serviceClient);

    // Return minimal data — no full customer details
    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        total: order.total,
        status: order.status,
        deliveryDate: order.deliveryDate,
        items: order.items.map((item) => ({
          menuItemId: item.menuItem.id,
          menuItemName: item.menuItem.nameEn,
          unitPrice: item.menuItem.price,
          quantity: item.quantity,
        })),
      })),
    });
  } catch (err: unknown) {
    console.error('[orders/lookup] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to look up orders' },
      { status: 500 }
    );
  }
}
