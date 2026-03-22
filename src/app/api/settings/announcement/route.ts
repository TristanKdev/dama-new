import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const db = createServiceRoleClient();

    const { data } = await db
      .from('site_settings')
      .select('key, value')
      .in('key', ['announcement_text', 'announcement_active', 'announcement_color']);

    const settings: Record<string, string> = {};
    for (const row of (data ?? []) as { key: string; value: string }[]) {
      settings[row.key] = row.value;
    }

    if (settings.announcement_active !== 'true' || !settings.announcement_text) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      text: settings.announcement_text,
      color: settings.announcement_color || 'green',
    });
  } catch (err: unknown) {
    console.error('[settings/announcement] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ active: false });
  }
}
