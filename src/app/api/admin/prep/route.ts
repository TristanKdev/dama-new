import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  // Default to today in ET (business timezone)
  const targetDate = dateParam || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());

  // Get all orders for this delivery date that aren't cancelled
  const { data: orders, error: ordersError } = await supabase!
    .from('orders')
    .select('id, customer_name, customer_phone, delivery_method, delivery_address, status, notes, total')
    .eq('delivery_date', targetDate)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true });

  if (ordersError) {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }

  // Get all order items for these orders
  const orderIds = (orders ?? []).map((o: { id: string }) => o.id);
  let items: { order_id: string; menu_item_name: string; quantity: number; unit_price: number; subtotal: number }[] = [];

  if (orderIds.length > 0) {
    const { data: itemsData } = await supabase!
      .from('order_items')
      .select('order_id, menu_item_name, quantity, unit_price, subtotal')
      .in('order_id', orderIds);
    items = (itemsData ?? []) as typeof items;
  }

  // Aggregate items across all orders for the prep summary
  const prepSummary: Record<string, { name: string; totalQuantity: number; orders: number }> = {};
  for (const item of items) {
    if (!prepSummary[item.menu_item_name]) {
      prepSummary[item.menu_item_name] = { name: item.menu_item_name, totalQuantity: 0, orders: 0 };
    }
    prepSummary[item.menu_item_name].totalQuantity += item.quantity;
    prepSummary[item.menu_item_name].orders += 1;
  }

  const prepList = Object.values(prepSummary).sort((a, b) => b.totalQuantity - a.totalQuantity);

  // Build per-order details with items
  const orderDetails = (orders ?? []).map((order: { id: string; customer_name: string; customer_phone: string; delivery_method: string; delivery_address: string | null; status: string; notes: string | null; total: number }) => ({
    ...order,
    items: items.filter((i) => i.order_id === order.id),
  }));

  // Count by delivery method
  const deliveryCounts = {
    delivery: (orders ?? []).filter((o: { delivery_method: string }) => o.delivery_method === 'building-delivery').length,
    pickup: (orders ?? []).filter((o: { delivery_method: string }) => o.delivery_method === 'pickup').length,
  };

  return NextResponse.json({
    date: targetDate,
    totalOrders: orders?.length ?? 0,
    deliveryCounts,
    prepList,
    orders: orderDetails,
  });
}
