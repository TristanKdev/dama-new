import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';

// Allowlist of valid settings keys (must match SETTING_GROUPS in admin/settings/page.tsx)
const VALID_SETTINGS_KEYS = new Set([
  'announcement_text', 'announcement_color', 'announcement_active',
  'business_name', 'business_email', 'business_phone', 'business_address',
  'social_instagram', 'social_facebook', 'social_tiktok',
  'delivery_fee', 'free_delivery_minimum', 'delivery_window', 'pickup_window',
  'min_order_amount', 'order_cutoff_hours', 'max_orders_per_day',
  'admin_notification_email', 'order_confirmation_bcc',
]);

export async function GET() {
  const { supabase, error } = await getAdminSupabase();
  if (error) return error;

  const { data } = await supabase!
    .from('site_settings')
    .select('*')
    .limit(100);

  // Convert rows to key-value map
  const settings: Record<string, string> = {};
  for (const row of (data ?? []) as { key: string; value: string }[]) {
    settings[row.key] = row.value;
  }

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }

    // Upsert each setting (only known keys allowed)
    const entries = Object.entries(settings as Record<string, string>)
      .filter(([key]) => VALID_SETTINGS_KEYS.has(key));
    for (const [key, value] of entries) {
      const { error: upsertError } = await supabase!
        .from('site_settings')
        .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (upsertError) {
        return NextResponse.json({ error: `Failed to save setting: ${key}` }, { status: 500 });
      }
    }

    await logAdminAction({
      adminId: user!.id,
      action: 'update',
      table: 'site_settings',
      details: { keys: entries.map(([k]) => k) },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/settings] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
