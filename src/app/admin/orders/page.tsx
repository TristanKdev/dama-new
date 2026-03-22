'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../components/StatusBadge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const UPDATE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  delivery_date: string;
  order_items: { id: string; menu_item_name: string; quantity: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('confirmed');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set('status', statusFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setFetchError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, statusFilter, debouncedSearch, dateFrom, dateTo]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkUpdating(true);
    try {
      const res = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedIds), status: bulkStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => selectedIds.has(o.id) ? { ...o, status: bulkStatus } : o)
        );
        setSelectedIds(new Set());
      }
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);

      const res = await fetch(`/api/admin/orders/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Orders</h1>
        <Button size="sm" variant="secondary" onClick={handleExport} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="w-44">
          <Select
            id="statusFilter"
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-56">
          <Input
            id="search"
            label="Search"
            placeholder="Name, email, or order ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label htmlFor="dateFrom" className="mb-1 block text-xs font-medium text-dama-charcoal/60">From Date</label>
          <input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
          />
        </div>
        <div className="w-40">
          <label htmlFor="dateTo" className="mb-1 block text-xs font-medium text-dama-charcoal/60">To Date</label>
          <input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button size="sm" variant="ghost" onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}>
            Clear Dates
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-dama-green-200 bg-dama-green-50 px-4 py-3">
          <span className="text-sm font-medium text-dama-green-700">{selectedIds.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded border border-dama-sand bg-white px-2 py-1.5 text-sm text-dama-charcoal"
          >
            {UPDATE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button size="sm" variant="primary" onClick={handleBulkUpdate} disabled={isBulkUpdating}>
            {isBulkUpdating ? 'Updating...' : 'Apply Status'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{fetchError}</span>
          <Button size="sm" variant="ghost" onClick={fetchOrders}>Retry</Button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-dama-sand bg-white">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-dama-charcoal/50">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dama-sand">
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.size === orders.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-dama-sand text-dama-green-500 focus:ring-dama-green-400"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Order</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Delivery</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Items</th>
                <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Total</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Status</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dama-sand/50">
              {orders.map((order) => (
                <tr key={order.id} className={`hover:bg-dama-ivory/50 ${selectedIds.has(order.id) ? 'bg-dama-green-50/50' : ''}`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="h-4 w-4 rounded border-dama-sand text-dama-green-500 focus:ring-dama-green-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-dama-green-600 hover:underline">
                      {order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-dama-charcoal">{order.customer_name}</p>
                    <p className="text-xs text-dama-charcoal/50">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {order.delivery_date || new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-dama-charcoal">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="rounded border border-dama-sand bg-white px-2 py-1 text-xs text-dama-charcoal"
                    >
                      {UPDATE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-dama-charcoal/50">No orders found.</td>
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
