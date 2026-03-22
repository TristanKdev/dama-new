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
    .from('subscriptions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status) {
    query = query.eq('status', status);
  }

  if (rawSearch) {
    const search = sanitizeSearchInput(rawSearch);
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load subscriptions' }, { status: 500 });
  }

  return NextResponse.json({
    subscriptions: data,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}
