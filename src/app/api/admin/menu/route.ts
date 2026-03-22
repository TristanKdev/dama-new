import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { sanitizeText } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const body = await request.json();
    const { name_en, name_ko, description, price, category, serving_size, dietary_tags, ingredients, spice_level, image_url, subcategory, badges, upgrade_price, set_contents } = body;

    if (!name_en || price == null || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required.' },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase!
      .from('menu_items')
      .insert({
        name_en: sanitizeText(name_en, 200),
        name_ko: name_ko ? sanitizeText(name_ko, 200) : '',
        description: description ? sanitizeText(description, 2000) : '',
        price: Number(price),
        category: sanitizeText(category, 50),
        serving_size: serving_size ? sanitizeText(serving_size, 100) : '',
        dietary_tags: Array.isArray(dietary_tags) ? dietary_tags.filter((t: unknown) => typeof t === 'string').map((t: string) => sanitizeText(t, 100)) : [],
        ingredients: Array.isArray(ingredients) ? ingredients.filter((t: unknown) => typeof t === 'string').map((t: string) => sanitizeText(t, 200)) : [],
        spice_level: Number(spice_level) || 0,
        image_url: image_url ? sanitizeText(image_url, 500) : '',
        subcategory: subcategory ? sanitizeText(subcategory, 50) : null,
        badges: Array.isArray(badges) ? badges.filter((t: unknown) => typeof t === 'string').map((t: string) => sanitizeText(t, 50)) : null,
        upgrade_price: upgrade_price ? Number(upgrade_price) : null,
        set_contents: Array.isArray(set_contents) ? set_contents.filter((t: unknown) => typeof t === 'string').map((t: string) => sanitizeText(t, 200)) : null,
        available: true,
        sold_out: false,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'create', table: 'menu_items', recordId: data.id });

    return NextResponse.json({ item: data });
  } catch (err: unknown) {
    console.error('[admin/menu] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
