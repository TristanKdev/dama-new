import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { isValidUUID } from '@/lib/validation';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, error } = await getAdminSupabase();
  if (error) return error;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid subscriber ID' }, { status: 400 });
  }

  const { error: deleteError } = await supabase!
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 });
  }

  await logAdminAction({ adminId: user!.id, action: 'delete', table: 'newsletter_subscribers', recordId: id });

  return NextResponse.json({ success: true });
}
