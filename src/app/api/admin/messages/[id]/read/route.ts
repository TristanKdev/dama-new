import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { isValidUUID } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, error } = await getAdminSupabase();
  if (error) return error;

  const { id } = await params;

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
  }

  // Check if body specifies read state (for toggle support)
  let markRead = true;
  try {
    const body = await request.json();
    if (body && typeof body.read === 'boolean') {
      markRead = body.read;
    }
  } catch {
    // No body or invalid JSON — default to marking as read
  }

  // Verify message exists before updating
  const { data: existing, error: fetchError } = await supabase!
    .from('contact_submissions')
    .select('id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  const { error: updateError } = await supabase!
    .from('contact_submissions')
    .update({ read_at: markRead ? new Date().toISOString() : null })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }

  await logAdminAction({ adminId: user!.id, action: 'update', table: 'contact_submissions', recordId: id, details: { marked_read: markRead } });

  return NextResponse.json({ success: true });
}
