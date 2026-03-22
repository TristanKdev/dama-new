import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sanitizeText, isValidUUID } from '@/lib/validation';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, error } = await getAdminSupabase();
  if (error) return error;

  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid FAQ ID' }, { status: 400 });
    }

    const body = await request.json();
    const { question, answer, category, sort_order } = body;

    if (!question || !answer || !category) {
      return NextResponse.json({ error: 'Question, answer, and category are required' }, { status: 400 });
    }

    const { error: updateError } = await supabase!
      .from('faqs')
      .update({
        question: sanitizeText(question, 500),
        answer: sanitizeText(answer, 5000),
        category: sanitizeText(category, 100),
        sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    await logAdminAction({ adminId: user!.id, action: 'update', table: 'faqs', recordId: id });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/faqs] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: 'Failed to update FAQ.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, error } = await getAdminSupabase();
  if (error) return error;

  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid FAQ ID' }, { status: 400 });
    }

    const { error: deleteError } = await supabase!
      .from('faqs')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    await logAdminAction({ adminId: user!.id, action: 'delete', table: 'faqs', recordId: id });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/faqs] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: 'Failed to delete FAQ.' },
      { status: 500 }
    );
  }
}
