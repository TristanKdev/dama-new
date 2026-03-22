'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/cart-store';

interface OrderItemDetail {
  menuItemId: string;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
}

interface OrderSummary {
  id: string;
  createdAt: string;
  itemCount: number;
  total: number;
  status: string;
  deliveryDate: string;
  items: OrderItemDetail[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  'out-for-delivery': 'bg-orange-100 text-orange-800',
  delivered: 'bg-dama-green-100 text-dama-green-700',
  cancelled: 'bg-red-100 text-red-800',
};

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

function OrderStatusTimeline({ currentStatus }: { currentStatus: string }) {
  const activeSteps = ['confirmed', 'preparing', 'out-for-delivery', 'delivered'];
  const stepLabels: Record<string, string> = {
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered',
  };

  if (currentStatus === 'cancelled') {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Order Cancelled
      </div>
    );
  }

  if (currentStatus === 'pending') {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700">
        <svg className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Awaiting Confirmation
      </div>
    );
  }

  const currentIndex = activeSteps.indexOf(currentStatus);

  return (
    <div className="mt-3 flex items-center gap-1">
      {activeSteps.map((step, idx) => {
        const isCompleted = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isCompleted
                    ? 'bg-dama-green-500 text-white'
                    : 'bg-dama-sand/50 text-dama-charcoal/50'
                } ${isCurrent ? 'ring-2 ring-dama-green-200' : ''}`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`mt-1 text-[10px] leading-tight ${isCompleted ? 'font-medium text-dama-charcoal' : 'text-dama-charcoal/60'}`}>
                {stepLabels[step]}
              </span>
            </div>
            {idx < activeSteps.length - 1 && (
              <div className={`mx-0.5 mb-4 h-0.5 w-4 sm:w-6 ${idx < currentIndex ? 'bg-dama-green-500' : 'bg-dama-sand/50'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reorderMessage, setReorderMessage] = useState('');
  const reorderTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    };
  }, []);

  // Auto-fetch orders for logged-in users
  useEffect(() => {
    if (!user?.email) return;
    setIsLoading(true);
    fetch('/api/orders/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email.toLowerCase() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Lookup failed');
        return res.json();
      })
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      if (!res.ok) throw new Error('Lookup failed');

      const data = await res.json();
      setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (order: OrderSummary) => {
    setReorderingId(order.id);
    setReorderMessage('');
    try {
      // Fetch current menu items to get full data (images, descriptions, etc.)
      const { getMenuItemsByIds } = await import('@/lib/queries');
      const menuItemIds = order.items.map(i => i.menuItemId);
      let currentItems: Awaited<ReturnType<typeof getMenuItemsByIds>> = [];
      try {
        currentItems = await getMenuItemsByIds(menuItemIds);
      } catch {
        // Fallback: use stored order data if menu fetch fails
      }
      const menuMap = new Map(currentItems.map(i => [i.id, i]));

      let addedCount = 0;
      const skippedItems: string[] = [];
      for (const item of order.items) {
        const fullItem = menuMap.get(item.menuItemId);
        if (fullItem && !fullItem.soldOut && fullItem.available) {
          for (let q = 0; q < item.quantity; q++) {
            addItem(fullItem);
          }
          addedCount += item.quantity;
        } else {
          skippedItems.push(item.menuItemName);
        }
      }

      if (skippedItems.length > 0) {
        setReorderMessage(`Some items are no longer available and were skipped: ${skippedItems.join(', ')}`);
        if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
        reorderTimerRef.current = setTimeout(() => setReorderMessage(''), 8000);
      }

      if (addedCount > 0) {
        openCart();
      } else if (skippedItems.length > 0) {
        setReorderMessage('All items from this order are no longer available.');
      }
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="bg-dama-cream py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <Link href="/account" className="text-sm text-dama-green-600 hover:underline">&larr; Back to Account</Link>
        <h1 className="mt-4 font-cormorant text-3xl font-semibold text-dama-charcoal">Order History</h1>

        {reorderMessage && (
          <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            {reorderMessage}
          </div>
        )}

        {/* Show email lookup only if not logged in */}
        {!user && (
          <form onSubmit={handleLookup} className="mt-8 flex gap-3">
            <div className="flex-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to find orders"
              />
            </div>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? 'Looking up...' : 'Find Orders'}
            </Button>
          </form>
        )}

        {isLoading && user && (
          <div className="mt-8 text-sm text-dama-charcoal/60">Loading your orders...</div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-dama-error">{error}</div>
        )}

        {/* Results */}
        {orders !== null && (
          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center">
                <p className="text-base text-dama-charcoal/60">No orders yet.</p>
                <Link href="/menu" className="mt-4 inline-block">
                  <Button size="sm" variant="secondary">Browse Menu</Button>
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-lg bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-dama-charcoal">{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-dama-charcoal/50">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {' '}&middot;{' '}{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-dama-charcoal">${order.total.toFixed(2)}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Status timeline */}
                  <OrderStatusTimeline currentStatus={order.status} />

                  {/* Expandable item details */}
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-dama-green-600 hover:underline"
                  >
                    {expandedId === order.id ? 'Hide items' : 'View items'}
                    <svg className={`h-3 w-3 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedId === order.id && order.items && (
                    <div className="mt-3 space-y-1.5 border-t border-dama-sand pt-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-dama-charcoal/70">
                          <span>{item.menuItemName} x{item.quantity}</span>
                          <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reorder button — only for delivered/completed orders */}
                  {(order.status === 'delivered' || order.status === 'confirmed' || order.status === 'preparing') && order.items?.length > 0 && (
                    <div className="mt-3 border-t border-dama-sand pt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={reorderingId === order.id}
                        onClick={() => handleReorder(order)}
                      >
                        {reorderingId === order.id ? 'Adding to cart...' : 'Reorder'}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
