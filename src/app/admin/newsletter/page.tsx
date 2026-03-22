'use client';

import { useState, useEffect } from 'react';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const pageSize = 50;

  const fetchSubscribers = async (p: number) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/newsletter?page=${p}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
    } catch {
      setFetchError('Failed to load subscribers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers(page);
  }, [page]);

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Newsletter Subscribers</h1>
        <span className="text-sm text-dama-charcoal/50">{total} subscriber{total !== 1 ? 's' : ''}</span>
      </div>

      {fetchError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{fetchError}</span>
          <button onClick={() => fetchSubscribers(page)} className="rounded-md px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100">Retry</button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-dama-sand bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dama-sand">
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Email</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Subscribed</th>
              <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dama-sand/50">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-dama-charcoal/50">Loading...</td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-dama-charcoal/50">No subscribers yet.</td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-dama-ivory/50">
                  <td className="px-4 py-3 font-medium text-dama-charcoal">{sub.email}</td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {new Date(sub.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleRemove(sub.id)} className="text-xs font-medium text-dama-error hover:underline">
                      Remove
                    </button>
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
