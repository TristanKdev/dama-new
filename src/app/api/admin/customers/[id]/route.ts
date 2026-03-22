import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { isValidUUID } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  // Get profile
  const { data: profile, error: profileError } = await supabase!
    .from('profiles')
    .select('id, full_name, phone, delivery_address, created_at, role, admin_notes')
    .eq('id', id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // Get orders
  const { data: orders } = await supabase!
    .from('orders')
    .select('id, customer_name, customer_email, total, status, payment_status, delivery_date, delivery_method, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get subscriptions
  const { data: subscriptions } = await supabase!
    .from('subscriptions')
    .select('id, plan_name, frequency, delivery_day, status, next_delivery_date, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  // Calculate stats
  const orderList = orders ?? [];
  const totalSpent = orderList
    .filter((o: { payment_status: string | null }) => o.payment_status === 'completed')
    .reduce((sum: number, o: { total: number }) => sum + o.total, 0);
  const email = orderList.length > 0 ? (orderList[0] as { customer_email: string }).customer_email : null;

  return NextResponse.json({
    customer: {
      ...profile,
      email,
      totalOrders: orderList.length,
      totalSpent,
    },
    orders: orderList,
    subscriptions: subscriptions ?? [],
  });
}
