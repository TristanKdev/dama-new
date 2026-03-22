'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';

interface AuditLog {
  id: string;
  admin_id: string;
  action: 'create' | 'update' | 'delete';
  table_name: string;
  record_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const TABLE_FILTER_OPTIONS = [
  { value: '', label: 'All Tables' },
  { value: 'orders', label: 'Orders' },
  { value: 'menu_items', label: 'Menu Items' },
  { value: 'promo_codes', label: 'Promo Codes' },
  { value: 'eligible_buildings', label: 'Buildings' },
  { value: 'delivery_schedule', label: 'Delivery Schedule' },
  { value: 'delivery_blackout_dates', label: 'Blackout Dates' },
  { value: 'faqs', label: 'FAQs' },
  { value: 'newsletter_subscribers', label: 'Newsletter' },
  { value: 'subscriptions', label: 'Subscriptions' },
];

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tableFilter, setTableFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 50;

  const fetchLogs = async (p: number, table: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (table) params.set('table', table);
      const res = await fetch(`/api/admin/audit-log?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, tableFilter);
  }, [page, tableFilter]);

  const handleTableChange = (value: string) => {
    setTableFilter(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDetails = (details: Record<string, unknown> | null): string => {
    if (!details) return '';
    const entries = Object.entries(details);
    if (entries.length === 0) return '';
    return entries
      .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`)
      .join(', ');
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Audit Log</h1>
        <div className="w-48">
          <Select
            id="table-filter"
            options={TABLE_FILTER_OPTIONS}
            value={tableFilter}
            onChange={(e) => handleTableChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-dama-sand bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dama-sand">
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Time</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Action</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Table</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Record</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dama-sand/50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-dama-charcoal/50">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-dama-charcoal/50">No audit logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-dama-ivory/50">
                  <td className="whitespace-nowrap px-4 py-3 text-dama-charcoal/60">
                    {new Date(log.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium uppercase ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal/70">{log.table_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-dama-charcoal/50">
                    {log.record_id ? log.record_id.slice(0, 8) : '—'}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-dama-charcoal/50">
                    {formatDetails(log.details) || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded px-3 py-1.5 text-xs font-medium text-dama-charcoal/60 hover:bg-dama-sand disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-dama-charcoal/50">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded px-3 py-1.5 text-xs font-medium text-dama-charcoal/60 hover:bg-dama-sand disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
