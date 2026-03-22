import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error: queryError, count } = await supabase!
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('subscribed_at', { ascending: false })
    .range(from, to);

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }

  return NextResponse.json({
    subscribers: data,
    total: count ?? 0,
    page,
    pageSize,
  });
}
