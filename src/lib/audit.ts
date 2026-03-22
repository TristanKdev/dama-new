import { createServiceRoleClient } from '@/lib/supabase';

/**
 * Log an admin action for audit trail.
 * Uses service role client to bypass RLS.
 * Failures are silently caught — audit logging should never break the main operation.
 */
export async function logAdminAction(params: {
  adminId: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  recordId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const db = createServiceRoleClient();
    await db.from('audit_logs').insert({
      admin_id: params.adminId,
      action: params.action,
      table_name: params.table,
      record_id: params.recordId ?? null,
      details: params.details ?? null,
    });
  } catch (err) {
    // Never let audit logging break the main operation
    console.error('[audit] Failed to log admin action:', err);
  }
}
