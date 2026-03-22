import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { isValidDateString } from '@/lib/validation';

// Prevent CSV formula injection by prefixing suspect cells
function csvSafe(cell: unknown): string {
  const str = String(cell ?? '').replace(/"/g, '""');
  if (/^[=+@\-]/.test(str)) return `'${str}`;
  return str;
}

export async function GET(request: Request) {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get('from');
  const dateTo = searchParams.get('to');
  const status = searchParams.get('status');

  let query = supabase!
    .from('orders')
    .select('id, customer_name, customer_email, customer_phone, delivery_date, delivery_method, delivery_address, status, payment_status, subtotal, delivery_fee, total, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (dateFrom && isValidDateString(dateFrom)) query = query.gte('delivery_date', dateFrom);
  if (dateTo && isValidDateString(dateTo)) query = query.lte('delivery_date', dateTo);
  if (status) query = query.eq('status', status);

  const { data: orders, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 });
  }

  // Build CSV
  const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Delivery Date', 'Method', 'Address', 'Status', 'Payment', 'Subtotal', 'Delivery Fee', 'Total', 'Notes', 'Created'];
  const rows = (orders ?? []).map((o: Record<string, unknown>) => [
    o.id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.delivery_date,
    o.delivery_method,
    o.delivery_address || '',
    o.status,
    o.payment_status || '',
    o.subtotal,
    o.delivery_fee,
    o.total,
    o.notes || '',
    o.created_at,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row: unknown[]) => row.map((cell) => `"${csvSafe(cell)}"`).join(',')),
  ].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
