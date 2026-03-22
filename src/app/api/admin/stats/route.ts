import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';

export async function GET() {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const now = new Date();
  // Use ET (business timezone) for date boundaries
  const etFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' });
  const today = etFormatter.format(now);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    todayOrders,
    pendingOrders,
    weekRevenue,
    monthRevenue,
    totalCustomers,
    activeSubscriptions,
    unreadMessages,
    monthOrders,
    soldOutItems,
  ] = await Promise.all([
    supabase!.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase!.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase!.from('orders').select('total').gte('created_at', weekAgo).neq('status', 'cancelled').eq('payment_status', 'completed'),
    supabase!.from('orders').select('total').gte('created_at', monthAgo).neq('status', 'cancelled').eq('payment_status', 'completed'),
    supabase!.from('profiles').select('id', { count: 'exact', head: true }),
    supabase!.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase!.from('contact_submissions').select('id', { count: 'exact', head: true }).is('read_at', null),
    // Last 30 days orders with dates for chart data
    supabase!.from('orders').select('id, total, created_at, status, payment_status, user_id').gte('created_at', monthAgo).neq('status', 'cancelled'),
    // Sold out menu items
    supabase!.from('menu_items').select('id, name_en').eq('sold_out', true),
  ]);

  // Get top selling items by fetching order_items for the month's orders
  const monthOrderIds = (monthOrders.data ?? []).map((o: { id: string }) => o.id);
  let topItemsData: { menu_item_name: string; quantity: number; subtotal: number }[] = [];
  if (monthOrderIds.length > 0) {
    const { data } = await supabase!
      .from('order_items')
      .select('menu_item_name, quantity, subtotal')
      .in('order_id', monthOrderIds);
    topItemsData = (data ?? []) as typeof topItemsData;
  }

  const weekRevenueTotal = (weekRevenue.data ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0);
  const monthRevenueTotal = (monthRevenue.data ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0);

  // Build daily revenue chart (last 30 days)
  const dailyRevenue: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = etFormatter.format(d);
    dailyRevenue[key] = { revenue: 0, orders: 0 };
  }

  for (const order of (monthOrders.data ?? []) as { total: number; created_at: string; payment_status: string }[]) {
    const day = order.created_at.split('T')[0];
    if (dailyRevenue[day]) {
      dailyRevenue[day].orders += 1;
      if (order.payment_status === 'completed') {
        dailyRevenue[day].revenue += order.total;
      }
    }
  }

  const revenueChart = Object.entries(dailyRevenue).map(([date, data]) => ({
    date,
    revenue: Math.round(data.revenue * 100) / 100,
    orders: data.orders,
  }));

  // Aggregate top selling items
  const itemAgg: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const item of topItemsData) {
    if (!itemAgg[item.menu_item_name]) {
      itemAgg[item.menu_item_name] = { name: item.menu_item_name, quantity: 0, revenue: 0 };
    }
    itemAgg[item.menu_item_name].quantity += item.quantity;
    itemAgg[item.menu_item_name].revenue += item.subtotal;
  }
  const topSellingItems = Object.values(itemAgg)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  // Calculate average order value
  const completedOrders = (monthOrders.data ?? []).filter((o: { payment_status: string }) => o.payment_status === 'completed');
  const avgOrderValue = completedOrders.length > 0
    ? Math.round((monthRevenueTotal / completedOrders.length) * 100) / 100
    : 0;

  // Calculate repeat customer rate (customers with 2+ orders in last 30 days)
  const customerOrderCounts: Record<string, number> = {};
  for (const order of (monthOrders.data ?? []) as { user_id: string | null }[]) {
    if (order.user_id) {
      customerOrderCounts[order.user_id] = (customerOrderCounts[order.user_id] || 0) + 1;
    }
  }
  const uniqueCustomers = Object.keys(customerOrderCounts).length;
  const repeatCustomers = Object.values(customerOrderCounts).filter((c) => c >= 2).length;
  const repeatCustomerRate = uniqueCustomers > 0
    ? Math.round((repeatCustomers / uniqueCustomers) * 100)
    : 0;

  return NextResponse.json({
    todayOrders: todayOrders.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    weekRevenue: weekRevenueTotal,
    monthRevenue: monthRevenueTotal,
    totalCustomers: totalCustomers.count ?? 0,
    activeSubscriptions: activeSubscriptions.count ?? 0,
    unreadMessages: unreadMessages.count ?? 0,
    revenueChart,
    topSellingItems,
    soldOutItems: soldOutItems.data ?? [],
    avgOrderValue,
    repeatCustomerRate,
  });
}
