import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { sanitizeSearchInput } from '@/lib/validation';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const rawSearch = searchParams.get('search');
  const search = rawSearch ? sanitizeSearchInput(rawSearch) : '';

  // If searching, first check orders table for email matches to find guest customers
  // and profile-linked customers searchable by email
  const emailMatchedUserIds: string[] = [];
  let guestCustomers: { email: string; name: string; phone: string; orderCount: number; createdAt: string }[] = [];

  if (search) {
    const { data: emailOrders } = await supabase!
      .from('orders')
      .select('user_id, customer_email, customer_name, customer_phone, created_at')
      .ilike('customer_email', `%${search}%`);

    const guestMap = new Map<string, { email: string; name: string; phone: string; orderCount: number; createdAt: string }>();
    for (const o of (emailOrders ?? []) as { user_id: string | null; customer_email: string; customer_name: string; customer_phone: string; created_at: string }[]) {
      if (o.user_id) {
        emailMatchedUserIds.push(o.user_id);
      } else {
        // Guest customer — aggregate by email
        const key = o.customer_email.toLowerCase();
        const existing = guestMap.get(key);
        if (existing) {
          existing.orderCount += 1;
        } else {
          guestMap.set(key, {
            email: o.customer_email,
            name: o.customer_name,
            phone: o.customer_phone,
            orderCount: 1,
            createdAt: o.created_at,
          });
        }
      }
    }
    guestCustomers = Array.from(guestMap.values());
  }

  // Get profiles with order counts
  let query = supabase!
    .from('profiles')
    .select('id, full_name, phone, delivery_address, created_at, role', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (search) {
    // Include name/phone matches AND email-matched user IDs
    if (emailMatchedUserIds.length > 0) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,id.in.(${emailMatchedUserIds.join(',')})`);
    } else {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }
  }

  const { data: profiles, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }

  // Get order counts and emails in a single query
  const profileIds = (profiles ?? []).map((p: { id: string }) => p.id);
  const orderCounts: Record<string, number> = {};
  const emailMap: Record<string, string> = {};

  if (profileIds.length > 0) {
    const { data: orders } = await supabase!
      .from('orders')
      .select('user_id, customer_email')
      .in('user_id', profileIds);

    for (const o of orders ?? []) {
      const uid = (o as { user_id: string }).user_id;
      orderCounts[uid] = (orderCounts[uid] || 0) + 1;
      if (uid && !emailMap[uid]) {
        emailMap[uid] = (o as { customer_email: string }).customer_email;
      }
    }
  }

  const customers = (profiles ?? []).map((p: { id: string; full_name: string | null; phone: string | null; delivery_address: string | null; created_at: string; role: string }) => ({
    ...p,
    email: emailMap[p.id] || null,
    orderCount: orderCounts[p.id] || 0,
  }));

  // Append guest customers when searching (they don't have profiles)
  const allCustomers = search
    ? [
        ...customers,
        ...guestCustomers.map(g => ({
          id: `guest-${g.email}`,
          full_name: g.name,
          phone: g.phone,
          delivery_address: null,
          created_at: g.createdAt,
          role: 'guest',
          email: g.email,
          orderCount: g.orderCount,
        })),
      ]
    : customers;

  return NextResponse.json({
    customers: allCustomers,
    total: (count ?? 0) + (search ? guestCustomers.length : 0),
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(((count ?? 0) + (search ? guestCustomers.length : 0)) / PAGE_SIZE),
  });
}
