'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filter === 'unread') params.set('unread', 'true');

      const res = await fetch(`/api/admin/messages?${params}`);
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data.messages ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setFetchError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    const res = await fetch(`/api/admin/messages/${id}/read`, { method: 'PATCH' });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read_at: new Date().toISOString() } : m))
      );
    }
  };

  return (
    <div>
      <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Messages</h1>

      {/* Filter Toggle */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            filter === 'all' ? 'bg-dama-green-500 text-white' : 'bg-white text-dama-charcoal/70 hover:bg-dama-ivory'
          )}
        >
          All
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(1); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            filter === 'unread' ? 'bg-dama-green-500 text-white' : 'bg-white text-dama-charcoal/70 hover:bg-dama-ivory'
          )}
        >
          Unread
        </button>
      </div>

      {fetchError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{fetchError}</span>
          <Button size="sm" variant="ghost" onClick={fetchMessages}>Retry</Button>
        </div>
      )}

      {/* Messages List */}
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="text-sm text-dama-charcoal/50">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-sm text-dama-charcoal/50">
            No messages found.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'rounded-lg border bg-white transition-colors',
                msg.read_at ? 'border-dama-sand' : 'border-dama-green-300 bg-dama-green-50/30'
              )}
            >
              <button
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {!msg.read_at && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-dama-green-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-dama-charcoal">{msg.name}</p>
                    <p className="text-xs text-dama-charcoal/50">{msg.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dama-charcoal">{msg.subject}</p>
                  <p className="text-xs text-dama-charcoal/60">
                    {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </button>

              {expandedId === msg.id && (
                <div className="border-t border-dama-sand/50 px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-dama-charcoal/80">
                    {msg.message}
                  </p>
                  {!msg.read_at && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-4"
                      onClick={() => markAsRead(msg.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
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
