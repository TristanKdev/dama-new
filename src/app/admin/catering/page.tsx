'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface CateringInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
}

export default function AdminCateringPage() {
  const [inquiries, setInquiries] = useState<CateringInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await fetch(`/api/admin/catering?${params}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setInquiries(data.inquiries ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setFetchError('Failed to load catering inquiries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const toggleRead = async (id: string, currentlyRead: boolean) => {
    const res = await fetch(`/api/admin/messages/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !currentlyRead }),
    });
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, read_at: !currentlyRead ? new Date().toISOString() : null }
            : i
        )
      );
    }
  };

  return (
    <div>
      <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Catering Inquiries</h1>

      {/* Filter */}
      <div className="mt-6 flex items-end gap-4">
        <div className="w-44">
          <label htmlFor="cateringFilter" className="mb-1 block text-xs font-medium text-dama-charcoal/60">Filter</label>
          <select
            id="cateringFilter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
          >
            <option value="">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {fetchError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{fetchError}</span>
          <Button size="sm" variant="ghost" onClick={fetchInquiries}>Retry</Button>
        </div>
      )}

      {/* Inquiries List */}
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="text-sm text-dama-charcoal/50">Loading...</div>
        ) : inquiries.length === 0 ? (
          <div className="rounded-lg border border-dama-sand bg-white px-4 py-8 text-center text-sm text-dama-charcoal/50">
            No catering inquiries found.
          </div>
        ) : (
          inquiries.map((inquiry) => {
            const isRead = !!inquiry.read_at;
            return (
              <div
                key={inquiry.id}
                className={`rounded-lg border bg-white transition-colors ${isRead ? 'border-dama-sand' : 'border-dama-green-300 bg-dama-green-50/30'}`}
              >
                <button
                  onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    {!isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-dama-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-dama-charcoal">{inquiry.name}</p>
                      <p className="text-xs text-dama-charcoal/50">{inquiry.email}{inquiry.phone ? ` · ${inquiry.phone}` : ''}</p>
                    </div>
                  </div>
                  <span className="text-xs text-dama-charcoal/60">
                    {new Date(inquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </button>

                {expandedId === inquiry.id && (
                  <div className="border-t border-dama-sand px-4 py-4">
                    <p className="whitespace-pre-wrap text-sm text-dama-charcoal leading-relaxed">{inquiry.message}</p>
                    <div className="mt-4 flex gap-3">
                      <Button size="sm" variant={isRead ? 'ghost' : 'secondary'} onClick={() => toggleRead(inquiry.id, isRead)}>
                        Mark as {isRead ? 'Unread' : 'Read'}
                      </Button>
                      <a
                        href={`mailto:${inquiry.email}?subject=RE: Catering Inquiry — DAM:A`}
                        className="inline-flex items-center rounded-md bg-dama-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-dama-green-600"
                      >
                        Reply via Email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
