'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  orderCount: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/admin/customers?${params}`);
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();
      setCustomers(data.customers ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setFetchError('Failed to load customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div>
      <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Customers</h1>

      <div className="mt-6 w-64">
        <Input
          id="search"
          label="Search"
          placeholder="Name or phone..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {fetchError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{fetchError}</span>
          <Button size="sm" variant="ghost" onClick={fetchCustomers}>Retry</Button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-dama-sand bg-white">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-dama-charcoal/50">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dama-sand">
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Name</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Email</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dama-sand/50">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-dama-ivory/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${customer.id}`} className="font-medium text-dama-green-600 hover:underline">
                      {customer.full_name || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal/70">{customer.email || '—'}</td>
                  <td className="px-4 py-3 text-dama-charcoal/70">{customer.phone || '—'}</td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-dama-charcoal">{customer.orderCount}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-dama-charcoal/50">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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
