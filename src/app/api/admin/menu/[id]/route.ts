import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSupabase } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit';
import { isValidSlug, sanitizeText } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const { id } = await params;
    if (!isValidSlug(id)) {
      return NextResponse.json({ error: 'Invalid menu item ID' }, { status: 400 });
    }

    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      'available', 'sold_out', 'price', 'description', 'name_en', 'name_ko',
      'serving_size', 'category', 'dietary_tags', 'ingredients', 'spice_level', 'image_url',
      'subcategory', 'badges', 'upgrade_price', 'set_contents',
    ];

    // Sanitize values before writing to DB
    const stringFields: Record<string, number> = { name_en: 200, name_ko: 200, description: 2000, serving_size: 100, category: 50, image_url: 500, subcategory: 50 };
    const arrayFields: Record<string, number> = { dietary_tags: 100, ingredients: 200, badges: 50, set_contents: 200 };

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        const val = body[key];
        if (key in stringFields && typeof val === 'string') {
          updates[key] = sanitizeText(val, stringFields[key]);
        } else if (key in arrayFields && Array.isArray(val)) {
          updates[key] = val.filter((t: unknown) => typeof t === 'string').map((t: string) => sanitizeText(t, arrayFields[key]));
        } else if (key === 'price' || key === 'spice_level' || key === 'upgrade_price') {
          updates[key] = val != null ? Number(val) : val;
        } else if (key === 'available' || key === 'sold_out') {
          updates[key] = Boolean(val);
        } else {
          updates[key] = val;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase!
      .from('menu_items')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }

    await logAdminAction({ adminId: user!.id, action: 'update', table: 'menu_items', recordId: id, details: updates });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/menu] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user, error } = await getAdminSupabase();
    if (error) return error;

    const { id } = await params;
    if (!isValidSlug(id)) {
      return NextResponse.json({ error: 'Invalid menu item ID' }, { status: 400 });
    }

    // Check if the item exists
    const { data: existing, error: fetchError } = await supabase!
      .from('menu_items')
      .select('id, name_en')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Check if item is referenced in any orders (soft-delete instead of hard-delete)
    const { count } = await supabase!
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('menu_item_id', id);

    if (count && count > 0) {
      // Item has order history — mark unavailable instead of deleting
      await supabase!
        .from('menu_items')
        .update({ available: false, sold_out: true })
        .eq('id', id);

      await logAdminAction({
        adminId: user!.id,
        action: 'update',
        table: 'menu_items',
        recordId: id,
        details: { action: 'soft_delete', reason: `Referenced in ${count} order items` },
      });

      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: `Item has ${count} order references — marked as unavailable instead of deleted.`,
      });
    }

    // No order references — safe to hard delete
    const { error: deleteError } = await supabase!
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[admin/menu/DELETE] Error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }

    await logAdminAction({
      adminId: user!.id,
      action: 'delete',
      table: 'menu_items',
      recordId: id,
      details: { name: existing.name_en },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/menu/DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
