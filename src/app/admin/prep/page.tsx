'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../components/StatusBadge';
import { formatPrice } from '@/lib/utils';

interface PrepItem {
  name: string;
  totalQuantity: number;
  orders: number;
}

interface PrepOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: string;
  delivery_address: string | null;
  status: string;
  notes: string | null;
  total: number;
  items: { menu_item_name: string; quantity: number; unit_price: number; subtotal: number }[];
}

interface PrepData {
  date: string;
  totalOrders: number;
  deliveryCounts: { delivery: number; pickup: number };
  prepList: PrepItem[];
  orders: PrepOrder[];
}

export default function AdminPrepPage() {
  const [data, setData] = useState<PrepData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const fetchPrep = async (date: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/prep?date=${date}`);
      if (!res.ok) throw new Error('Failed to load prep data');
      const json = await res.json();
      setData(json);
    } catch {
      setFetchError('Failed to load prep data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrep(selectedDate);
  }, [selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Kitchen Prep Sheet</h1>
          <p className="mt-1 text-sm text-dama-charcoal/50">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-dama-sand px-3 py-2 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
          />
          <button
            onClick={handlePrint}
            className="rounded-md bg-dama-charcoal px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-dama-charcoal/80 print:hidden"
          >
            Print
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{fetchError}</span>
          <button onClick={() => fetchPrep(selectedDate)} className="rounded-md px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 text-sm text-dama-charcoal/50">Loading prep data...</div>
      ) : !data || data.totalOrders === 0 ? (
        <div className="mt-8 rounded-lg border border-dama-sand bg-white p-8 text-center">
          <p className="text-dama-charcoal/50">No orders scheduled for this date.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-dama-sand bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Total Orders</p>
              <p className="mt-2 text-3xl font-semibold text-dama-charcoal">{data.totalOrders}</p>
            </div>
            <div className="rounded-lg border border-dama-sand bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Deliveries</p>
              <p className="mt-2 text-3xl font-semibold text-dama-charcoal">{data.deliveryCounts.delivery}</p>
            </div>
            <div className="rounded-lg border border-dama-sand bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Pickups</p>
              <p className="mt-2 text-3xl font-semibold text-dama-charcoal">{data.deliveryCounts.pickup}</p>
            </div>
          </div>

          {/* Prep List (what to make) */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-dama-charcoal">Items to Prepare</h2>
            <p className="mt-1 text-xs text-dama-charcoal/50">Total quantities needed across all orders.</p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-dama-sand bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dama-sand">
                    <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Item</th>
                    <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Total Qty</th>
                    <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60"># Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dama-sand/50">
                  {data.prepList.map((item) => (
                    <tr key={item.name}>
                      <td className="px-4 py-3 font-medium text-dama-charcoal">{item.name}</td>
                      <td className="px-4 py-3 text-right text-xl font-bold text-dama-green-600">{item.totalQuantity}</td>
                      <td className="px-4 py-3 text-right text-dama-charcoal/50">{item.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Orders */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-dama-charcoal">Order Details</h2>
            <p className="mt-1 text-xs text-dama-charcoal/50">Per-order breakdown for packing.</p>
            <div className="mt-4 space-y-4">
              {data.orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-dama-sand bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm font-semibold text-dama-green-600 hover:underline">
                          {order.id.slice(0, 8).toUpperCase()}
                        </Link>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-sm text-dama-charcoal">{order.customer_name}</p>
                      {order.customer_phone && (
                        <p className="text-xs text-dama-charcoal/50">{order.customer_phone}</p>
                      )}
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-medium capitalize text-dama-charcoal">
                        {order.delivery_method.replace(/-/g, ' ')}
                      </p>
                      {order.delivery_address && (
                        <p className="mt-0.5 text-dama-charcoal/50">{order.delivery_address}</p>
                      )}
                      <p className="mt-0.5 font-semibold text-dama-charcoal">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Note: {order.notes}
                    </div>
                  )}
                  <div className="mt-3 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-dama-charcoal">{item.menu_item_name}</span>
                        <span className="font-semibold text-dama-charcoal">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
