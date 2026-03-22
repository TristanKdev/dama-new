'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface LabelOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_date: string;
  delivery_method: string;
  delivery_address: string | null;
  status: string;
  notes: string | null;
  order_items: { menu_item_name: string; quantity: number }[];
}

export default function AdminLabelsPage() {
  const [orders, setOrders] = useState<LabelOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ dateFrom: date, dateTo: date });
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.orders ?? []).filter(
          (o: LabelOrder) => o.delivery_date === date && o.status !== 'cancelled'
        );
        setOrders(filtered);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [date]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Print Labels</h1>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
          />
          <Button variant="primary" onClick={handlePrint} disabled={orders.length === 0}>
            Print Labels
          </Button>
        </div>
      </div>

      <p className="mt-2 text-sm text-dama-charcoal/50 print:hidden">
        {formattedDate} — {orders.length} label{orders.length !== 1 ? 's' : ''}
      </p>

      {isLoading ? (
        <div className="mt-8 text-sm text-dama-charcoal/50 print:hidden">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dama-sand bg-white px-4 py-8 text-center text-sm text-dama-charcoal/50 print:hidden">
          No orders for this date.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-2 print:mt-0">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-dama-charcoal/20 bg-white p-4 print:rounded-none print:border-dama-charcoal print:p-3 print:text-[11px] break-inside-avoid"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-dama-sand pb-2 print:pb-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-dama-green-700 print:text-[10px]">DAM:A</p>
                  <p className="mt-0.5 text-[10px] text-dama-charcoal/50">
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-mono text-dama-charcoal/50 print:text-[9px]">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Customer */}
              <div className="mt-2 print:mt-1">
                <p className="text-sm font-semibold text-dama-charcoal print:text-[12px]">{order.customer_name}</p>
                {order.delivery_method === 'delivery' && order.delivery_address && (
                  <p className="mt-0.5 text-xs text-dama-charcoal/60 print:text-[10px]">{order.delivery_address}</p>
                )}
                {order.delivery_method === 'pickup' && (
                  <p className="mt-0.5 text-xs font-medium text-dama-charcoal/60 print:text-[10px]">PICKUP</p>
                )}
              </div>

              {/* Items */}
              <div className="mt-2 space-y-0.5 print:mt-1">
                {order.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-dama-charcoal print:text-[10px]">
                    <span>{item.menu_item_name}</span>
                    <span className="font-medium">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-2 rounded bg-amber-50 px-2 py-1 print:mt-1">
                  <p className="text-[10px] text-amber-700 print:text-[9px]">Note: {order.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
