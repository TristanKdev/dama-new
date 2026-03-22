import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sanitizeText } from '@/lib/validation';

export async function GET() {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { data, error: queryError } = await supabase!
    .from('eligible_buildings')
    .select('*')
    .order('neighborhood', { ascending: true })
    .order('name', { ascending: true });

  if (queryError) {
    return NextResponse.json({ error: 'Failed to load buildings' }, { status: 500 });
  }

  return NextResponse.json({ buildings: data });
}

export async function POST(request: Request) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const body = await request.json();
    const { name, address, zip_code, neighborhood } = body;

    if (!name || !address || !zip_code) {
      return NextResponse.json(
        { error: 'Name, address, and zip code are required.' },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase!
      .from('eligible_buildings')
      .insert({
        name: sanitizeText(name, 200),
        address: sanitizeText(address, 500),
        zip_code: sanitizeText(zip_code, 10),
        neighborhood: sanitizeText(neighborhood || '', 200),
        active: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create building' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'create', table: 'eligible_buildings', recordId: data.id });

    return NextResponse.json({ building: data });
  } catch (err: unknown) {
    console.error('[admin/buildings] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
