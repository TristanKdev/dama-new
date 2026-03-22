'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

const UPDATE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface SubscriptionRow {
  id: string;
  customer_name: string;
  customer_email: string;
  plan_name: string;
  price_per_delivery: number;
  frequency: string;
  delivery_day: string;
  status: string;
  next_delivery_date: string | null;
  created_at: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set('status', statusFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/admin/subscriptions?${params}`);
      if (!res.ok) throw new Error('Failed to load subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setFetchError('Failed to load subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleStatusUpdate = async (subId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/subscriptions/${subId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: newStatus } : s))
      );
    }
  };

  return (
    <div>
      <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Subscriptions</h1>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="w-48">
          <Select
            id="statusFilter"
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-64">
          <Input
            id="search"
            label="Search"
            placeholder="Name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {fetchError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{fetchError}</span>
          <Button size="sm" variant="ghost" onClick={fetchSubscriptions}>Retry</Button>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-dama-sand bg-white">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-dama-charcoal/50">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dama-sand">
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Frequency</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Delivery Day</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Next Delivery</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Status</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dama-sand/50">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-dama-ivory/50">
                  <td className="px-4 py-3">
                    <p className="text-dama-charcoal">{sub.customer_name}</p>
                    <p className="text-xs text-dama-charcoal/50">{sub.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal">{sub.plan_name}</td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {sub.frequency === 'weekly' ? 'Weekly' : 'Biweekly'}
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal/60">{sub.delivery_day}</td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {sub.next_delivery_date
                      ? new Date(sub.next_delivery_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={sub.status}
                      onChange={(e) => handleStatusUpdate(sub.id, e.target.value)}
                      className="rounded border border-dama-sand bg-white px-2 py-1 text-xs text-dama-charcoal"
                    >
                      {UPDATE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-dama-charcoal/50">No subscriptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-dama-charcoal/50">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
