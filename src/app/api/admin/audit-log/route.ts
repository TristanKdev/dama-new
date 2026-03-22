import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const table = searchParams.get('table') || '';
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase!
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (table) {
    query = query.eq('table_name', table);
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }

  return NextResponse.json({
    logs: data,
    total: count ?? 0,
    page,
    pageSize,
  });
}
