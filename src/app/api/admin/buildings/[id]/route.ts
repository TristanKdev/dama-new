import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sanitizeText, isValidUUID } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid building ID' }, { status: 400 });
    }
    const body = await request.json();

    const allowedFields = ['name', 'address', 'zip_code', 'neighborhood', 'active'];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string' ? sanitizeText(body[key], 500) : body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase!
      .from('eligible_buildings')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update building' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'update', table: 'eligible_buildings', recordId: id, details: updates });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/buildings] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, error } = await getAdminSupabase();
  if (error) return error;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid building ID' }, { status: 400 });
  }

  const { error: deleteError } = await supabase!
    .from('eligible_buildings')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete building' }, { status: 500 });
  }

  await logAdminAction({ adminId: user!.id, action: 'delete', table: 'eligible_buildings', recordId: id });

  return NextResponse.json({ success: true });
}
