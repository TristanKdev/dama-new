import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sanitizeText } from '@/lib/validation';
import type { FAQRow } from '@/types/database';

export async function GET() {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  try {
    const { data, error: queryError } = await supabase!
      .from('faqs')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (queryError) throw queryError;

    return NextResponse.json({ faqs: data as FAQRow[] });
  } catch (err: unknown) {
    console.error('[admin/faqs] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, user, error } = await getAdminSupabase();
  if (error) return error;

  try {
    const body = await request.json();
    const { question, answer, category, sort_order } = body;

    if (!question || !answer || !category) {
      return NextResponse.json(
        { success: false, message: 'Question, answer, and category are required.' },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase!
      .from('faqs')
      .insert({
        question: sanitizeText(question, 500),
        answer: sanitizeText(answer, 5000),
        category: sanitizeText(category, 100),
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await logAdminAction({ adminId: user!.id, action: 'create', table: 'faqs', recordId: data.id });

    return NextResponse.json({ success: true, faq: data });
  } catch (err: unknown) {
    console.error('[admin/faqs] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: 'Failed to create FAQ.' },
      { status: 500 }
    );
  }
}
