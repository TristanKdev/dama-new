'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface MenuItemAdmin {
  id: string;
  name_en: string;
  name_ko: string;
  price: number;
  category: string;
  image_url: string;
  available: boolean;
  sold_out: boolean;
  serving_size: string;
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { createBrowserClient } = await import('@/lib/supabase');
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name_en', { ascending: true });
      setItems(data ?? []);
    } catch {
      setFetchError('Failed to load menu items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleField = async (id: string, field: 'available' | 'sold_out', value: boolean) => {
    const res = await fetch(`/api/admin/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    }
  };

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading menu items...</div>;
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-sm text-red-700">{fetchError}</p>
        <button onClick={fetchMenuItems} className="rounded-md bg-dama-green-500 px-4 py-2 text-sm text-white hover:bg-dama-green-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Menu Items</h1>
        <Link href="/admin/menu/new">
          <Button size="sm">Add Item</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className="rounded-lg border border-dama-sand bg-white overflow-hidden"
            >
              {!item.available && (
                <div className="bg-dama-charcoal/10 px-4 py-1.5 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-dama-charcoal/60">Unavailable</span>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-dama-charcoal/60">{item.name_ko}</p>
                    <h3 className="font-medium text-dama-charcoal">{item.name_en}</h3>
                  </div>
                  <span className="text-sm font-semibold text-dama-green-600">{formatPrice(item.price)}</span>
                </div>
                <p className="mt-1 text-xs text-dama-charcoal/60 capitalize">
                  {item.category === 'dosirak' ? 'dosirak' : item.category}
                  {item.serving_size ? ` · ${item.serving_size}` : ''}
                </p>

                {/* Toggle Switches */}
                <div className="mt-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.available}
                      onClick={() => toggleField(item.id, 'available', !item.available)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${item.available ? 'bg-dama-green-500' : 'bg-dama-sand'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${item.available ? 'translate-x-4' : ''}`} />
                    </button>
                    Available
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.sold_out}
                      onClick={() => toggleField(item.id, 'sold_out', !item.sold_out)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${item.sold_out ? 'bg-dama-error' : 'bg-dama-sand'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${item.sold_out ? 'translate-x-4' : ''}`} />
                    </button>
                    Sold Out
                  </label>
                </div>

                <Link
                  href={`/admin/menu/${item.id}/edit`}
                  className="mt-3 inline-block text-xs font-medium text-dama-green-600 hover:underline"
                >
                  Edit Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
