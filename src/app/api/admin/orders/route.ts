import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { sanitizeSearchInput } from '@/lib/validation';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const rawSearch = searchParams.get('search');

  let query = supabase!
    .from('orders')
    .select('*, order_items(id, menu_item_name, quantity, unit_price, subtotal)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  if (dateFrom) {
    query = query.gte('delivery_date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('delivery_date', dateTo);
  }

  if (rawSearch) {
    const search = sanitizeSearchInput(rawSearch);
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,id.ilike.%${search}%`);
    }
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }

  return NextResponse.json({
    orders: data,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}
