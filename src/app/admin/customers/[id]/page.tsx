'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice } from '@/lib/utils';

interface CustomerDetail {
  id: string;
  full_name: string | null;
  phone: string | null;
  delivery_address: string | null;
  email: string | null;
  created_at: string;
  role: string;
  totalOrders: number;
  totalSpent: number;
  admin_notes: string | null;
}

interface CustomerOrder {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string | null;
  delivery_date: string;
  delivery_method: string;
  created_at: string;
}

interface CustomerSubscription {
  id: string;
  plan_name: string;
  frequency: string;
  delivery_day: string;
  status: string;
  next_delivery_date: string | null;
  created_at: string;
}

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomer(data.customer || null);
        setOrders(data.orders || []);
        setSubscriptions(data.subscriptions || []);
        setNotes(data.customer?.admin_notes || '');
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading customer...</div>;
  }

  if (!customer) {
    return <div className="text-sm text-dama-charcoal/60">Customer not found.</div>;
  }

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-dama-green-600 hover:underline">&larr; Back to Customers</Link>

      <h1 className="mt-4 font-cormorant text-2xl font-semibold text-dama-charcoal">
        {customer.full_name || 'Unknown Customer'}
      </h1>

      {/* Customer Info Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Email</p>
          <p className="mt-2 text-sm text-dama-charcoal">{customer.email || '—'}</p>
        </div>
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Phone</p>
          <p className="mt-2 text-sm text-dama-charcoal">{customer.phone || '—'}</p>
        </div>
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Total Orders</p>
          <p className="mt-2 text-2xl font-semibold text-dama-charcoal">{customer.totalOrders}</p>
        </div>
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Total Spent</p>
          <p className="mt-2 text-2xl font-semibold text-dama-green-600">{formatPrice(customer.totalSpent)}</p>
        </div>
      </div>

      {/* Extra Info */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Delivery Address</p>
          <p className="mt-2 text-sm text-dama-charcoal">{customer.delivery_address || 'Not saved'}</p>
        </div>
        <div className="rounded-lg border border-dama-sand bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">Member Since</p>
          <p className="mt-2 text-sm text-dama-charcoal">
            {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-dama-charcoal">Admin Notes</h2>
        <div className="mt-4 rounded-lg border border-dama-sand bg-white p-5">
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
            placeholder="Add private notes about this customer (dietary needs, preferences, issues...)"
            rows={4}
            className="w-full rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal placeholder:text-dama-charcoal/50 focus:border-dama-green-400 focus:outline-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={async () => {
                setIsSavingNotes(true);
                setNotesSaved(false);
                try {
                  const res = await fetch(`/api/admin/customers/${id}/notes`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admin_notes: notes }),
                  });
                  if (res.ok) setNotesSaved(true);
                } finally {
                  setIsSavingNotes(false);
                }
              }}
              disabled={isSavingNotes}
              className="rounded-md bg-dama-green-500 px-4 py-2 text-xs font-medium text-white hover:bg-dama-green-600 disabled:opacity-50"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
            {notesSaved && <span className="text-sm text-dama-green-600">Saved!</span>}
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-dama-charcoal">Subscriptions</h2>
          <div className="mt-4 divide-y divide-dama-sand rounded-lg border border-dama-sand bg-white">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-dama-charcoal">{sub.plan_name}</p>
                  <p className="text-xs text-dama-charcoal/50 capitalize">
                    {sub.frequency} &middot; {sub.delivery_day}
                    {sub.next_delivery_date && ` &middot; Next: ${sub.next_delivery_date}`}
                  </p>
                </div>
                <StatusBadge status={sub.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-dama-charcoal">Order History</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-dama-sand bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dama-sand">
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Order</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Date</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Delivery</th>
                <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Total</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dama-sand/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-dama-ivory/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-dama-green-600 hover:underline">
                      {order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {order.delivery_date} &middot; <span className="capitalize">{order.delivery_method.replace(/-/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-dama-charcoal">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-dama-charcoal/50">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
