'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface OrderDetail {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_date: string;
  delivery_method: string;
  delivery_address: string | null;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_reference: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
  order_items: {
    id: string;
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updateMsg, setUpdateMsg] = useState('');
  const [refundMsg, setRefundMsg] = useState('');
  const [refunding, setRefunding] = useState(false);
  const updateMsgTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (updateMsgTimerRef.current) clearTimeout(updateMsgTimerRef.current);
    };
  }, []);

  useEffect(() => {
    fetch(`/api/admin/orders?page=1&search=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.orders?.find((o: OrderDetail) => o.id === id);
        if (found) {
          setOrder(found);
          setStatus(found.status);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrder((prev) => prev ? { ...prev, status } : prev);
      setUpdateMsg('Status updated.');
      updateMsgTimerRef.current = setTimeout(() => setUpdateMsg(''), 3000);
    }
  };

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to refund this order? This cannot be undone.')) return;
    setRefunding(true);
    setRefundMsg('');
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRefundMsg('Refund processed successfully.');
        setOrder(prev => prev ? { ...prev, payment_status: 'refunded', status: 'cancelled' } : prev);
        setStatus('cancelled');
      } else {
        setRefundMsg(data.error || 'Refund failed.');
      }
    } catch {
      setRefundMsg('Refund request failed.');
    } finally {
      setRefunding(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading order...</div>;
  }

  if (!order) {
    return <div className="text-sm text-dama-charcoal/60">Order not found.</div>;
  }

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-dama-green-600 hover:underline">&larr; Back to Orders</Link>

      <div className="mt-4 flex items-center gap-4">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">
          Order {order.id.slice(0, 8).toUpperCase()}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal/50">Customer</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="text-dama-charcoal/50">Name:</span> <span className="text-dama-charcoal">{order.customer_name}</span></p>
            <p><span className="text-dama-charcoal/50">Email:</span> <span className="text-dama-charcoal">{order.customer_email}</span></p>
            <p><span className="text-dama-charcoal/50">Phone:</span> <span className="text-dama-charcoal">{order.customer_phone}</span></p>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal/50">Delivery</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="text-dama-charcoal/50">Method:</span> <span className="text-dama-charcoal capitalize">{order.delivery_method.replace(/-/g, ' ')}</span></p>
            <p><span className="text-dama-charcoal/50">Date:</span> <span className="text-dama-charcoal">{order.delivery_date}</span></p>
            {order.delivery_address && (
              <p><span className="text-dama-charcoal/50">Address:</span> <span className="text-dama-charcoal">{order.delivery_address}</span></p>
            )}
            {order.notes && (
              <p><span className="text-dama-charcoal/50">Notes:</span> <span className="text-dama-charcoal">{order.notes}</span></p>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal/50">Payment</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-dama-charcoal/50">Status:</span>{' '}
              <span className={`font-medium ${
                order.payment_status === 'completed' ? 'text-dama-green-600' :
                order.payment_status === 'refunded' ? 'text-dama-error' :
                order.payment_status === 'failed' ? 'text-dama-error' :
                'text-dama-charcoal'
              }`}>
                {order.payment_status || 'N/A'}
              </span>
            </p>
            {order.payment_reference && (
              <p><span className="text-dama-charcoal/50">Reference:</span> <span className="font-mono text-xs text-dama-charcoal">{order.payment_reference}</span></p>
            )}
            <p><span className="text-dama-charcoal/50">Amount:</span> <span className="text-dama-charcoal">{formatPrice(order.total)}</span></p>
          </div>
          {order.payment_status !== 'refunded' && order.payment_reference && (
            <div className="mt-3">
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-dama-error hover:bg-red-100 disabled:opacity-50"
              >
                {refunding ? 'Processing...' : 'Issue Full Refund'}
              </button>
            </div>
          )}
          {refundMsg && <p className="mt-2 text-xs text-dama-charcoal/70">{refundMsg}</p>}
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6 rounded-lg border border-dama-sand bg-white">
        <div className="border-b border-dama-sand px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal/50">Items</h2>
        </div>
        <div className="divide-y divide-dama-sand/50">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-dama-charcoal">{item.menu_item_name}</p>
                <p className="text-xs text-dama-charcoal/50">Qty: {item.quantity} &times; {formatPrice(item.unit_price)}</p>
              </div>
              <p className="text-sm font-medium text-dama-charcoal">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-dama-sand px-5 py-3 text-sm">
          <div className="flex justify-between text-dama-charcoal/60">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-dama-charcoal/60">
            <span>Delivery Fee</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-dama-sand pt-2 font-semibold text-dama-charcoal">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="mt-6 rounded-lg border border-dama-sand bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal/50">Update Status</h2>
        <div className="mt-3 flex items-end gap-3">
          <div className="w-48">
            <Select
              id="statusUpdate"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleStatusUpdate}>Update</Button>
        </div>
        {updateMsg && (
          <p className="mt-2 text-sm text-dama-green-700">{updateMsg}</p>
        )}
      </div>
    </div>
  );
}
