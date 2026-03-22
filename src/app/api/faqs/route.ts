import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import type { FAQRow } from '@/types/database';

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`faqs:${ip}`, RATE_LIMITS.publicRead);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ faqs: [] }, { status: 500 });
    }

    return NextResponse.json({ faqs: data as FAQRow[] });
  } catch (err: unknown) {
    console.error('[faqs] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ faqs: [] }, { status: 500 });
  }
}
