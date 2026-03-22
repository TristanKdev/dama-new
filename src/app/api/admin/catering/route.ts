import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const statusFilter = searchParams.get('status') || '';
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase!
    .from('contact_submissions')
    .select('*', { count: 'exact' })
    .eq('subject', 'Catering')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (statusFilter === 'unread') {
    query = query.is('read_at', null);
  } else if (statusFilter === 'read') {
    query = query.not('read_at', 'is', null);
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load catering inquiries' }, { status: 500 });
  }

  return NextResponse.json({
    inquiries: data,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
