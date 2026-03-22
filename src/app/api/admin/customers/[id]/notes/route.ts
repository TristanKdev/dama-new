import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { isValidUUID, sanitizeText } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const body = await request.json();
    const { admin_notes } = body;

    if (typeof admin_notes !== 'string') {
      return NextResponse.json({ error: 'Notes must be a string' }, { status: 400 });
    }

    const { error: updateError } = await supabase!
      .from('profiles')
      .update({ admin_notes: sanitizeText(admin_notes, 2000) })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
    }

    await logAdminAction({
      adminId: user!.id,
      action: 'update',
      table: 'profiles',
      recordId: id,
      details: { field: 'admin_notes' },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/customers/notes] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
