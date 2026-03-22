'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { StatusBadge } from './components/StatusBadge';
import { formatPrice } from '@/lib/utils';

interface Stats {
  todayOrders: number;
  pendingOrders: number;
  weekRevenue: number;
  monthRevenue: number;
  totalCustomers: number;
  activeSubscriptions: number;
  unreadMessages: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  topSellingItems: { name: string; quantity: number; revenue: number }[];
  soldOutItems: { id: string; name_en: string }[];
  avgOrderValue: number;
  repeatCustomerRate: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?page=1'),
      ]);
      if (!statsRes.ok || !ordersRes.ok) throw new Error('Failed to load dashboard');
      const [statsData, ordersData] = await Promise.all([statsRes.json(), ordersRes.json()]);
      setStats(statsData);
      setRecentOrders((ordersData.orders ?? []).slice(0, 5));
    } catch {
      setFetchError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading dashboard...</div>;
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-sm text-red-700">{fetchError}</p>
        <button onClick={loadDashboard} className="rounded-md bg-dama-green-500 px-4 py-2 text-sm text-white hover:bg-dama-green-600">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Today's Orders", value: stats?.todayOrders ?? 0, href: '/admin/orders' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, href: '/admin/orders', highlight: (stats?.pendingOrders ?? 0) > 0 },
    { label: "This Week's Revenue", value: formatPrice(stats?.weekRevenue ?? 0), href: null },
    { label: "This Month's Revenue", value: formatPrice(stats?.monthRevenue ?? 0), href: null },
    { label: 'Avg Order Value', value: formatPrice(stats?.avgOrderValue ?? 0), href: null },
    { label: 'Repeat Rate', value: `${stats?.repeatCustomerRate ?? 0}%`, href: '/admin/customers' },
    { label: 'Total Customers', value: stats?.totalCustomers ?? 0, href: '/admin/customers' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions ?? 0, href: '/admin/subscriptions' },
  ];

  // Revenue chart: simple bar visualization
  const chartData = stats?.revenueChart ?? [];
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Dashboard</h1>
        {(stats?.unreadMessages ?? 0) > 0 && (
          <Link
            href="/admin/messages"
            className="flex items-center gap-2 rounded-md bg-dama-green-50 px-3 py-1.5 text-xs font-medium text-dama-green-700 hover:bg-dama-green-100"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-dama-green-500" />
            {stats!.unreadMessages} unread message{stats!.unreadMessages !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const inner = (
            <div className={`rounded-lg border bg-white p-5 transition-colors ${card.highlight ? 'border-amber-300 bg-amber-50' : 'border-dama-sand'} ${card.href ? 'hover:border-dama-green-300' : ''}`}>
              <p className="text-xs font-medium uppercase tracking-wider text-dama-charcoal/50">{card.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${card.highlight ? 'text-amber-700' : 'text-dama-charcoal'}`}>{card.value}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>{inner}</Link>
          ) : (
            <div key={card.label}>{inner}</div>
          );
        })}
      </div>

      {/* Sold Out Alert */}
      {(stats?.soldOutItems ?? []).length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1l8 14H1L9 1z" />
              <path d="M9 6.5v3M9 12.5h.01" />
            </svg>
            <span className="text-sm font-semibold text-amber-800">
              {stats!.soldOutItems.length} menu item{stats!.soldOutItems.length !== 1 ? 's' : ''} marked unavailable
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {stats!.soldOutItems.map((item) => (
              <Link
                key={item.id}
                href={`/admin/menu/${item.id}/edit`}
                className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
              >
                {item.name_en}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/prep" className="rounded-md bg-dama-green-500 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-dama-green-600">
          Today&apos;s Prep Sheet
        </Link>
        <Link href="/admin/menu/new" className="rounded-md border border-dama-green-500 px-4 py-2 text-xs font-medium uppercase tracking-wider text-dama-green-600 hover:bg-dama-green-50">
          Add Menu Item
        </Link>
        <Link href="/admin/promos" className="rounded-md border border-dama-green-500 px-4 py-2 text-xs font-medium uppercase tracking-wider text-dama-green-600 hover:bg-dama-green-50">
          Manage Promos
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div>
          <h2 className="text-lg font-semibold text-dama-charcoal">Revenue (Last 30 Days)</h2>
          <div className="mt-4 rounded-lg border border-dama-sand bg-white p-5">
            {chartData.length > 0 ? (
              <div className="flex items-end gap-[2px]" style={{ height: 160 }}>
                {chartData.map((day) => {
                  const height = maxRevenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 4 : 0) : 0;
                  return (
                    <div key={day.date} className="group relative flex-1" title={`${day.date}: ${formatPrice(day.revenue)} (${day.orders} orders)`}>
                      <div
                        className="w-full rounded-t bg-dama-green-400 transition-colors group-hover:bg-dama-green-600"
                        style={{ height: `${height}%` }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-dama-charcoal px-2 py-1 text-[10px] text-white shadow-lg group-hover:block">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <br />{formatPrice(day.revenue)} &middot; {day.orders} order{day.orders !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-dama-charcoal/50">No data yet.</p>
            )}
            <div className="mt-2 flex justify-between text-[10px] text-dama-charcoal/60">
              <span>{chartData.length > 0 ? new Date(chartData[0].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div>
          <h2 className="text-lg font-semibold text-dama-charcoal">Top Items (Last 30 Days)</h2>
          <div className="mt-4 divide-y divide-dama-sand rounded-lg border border-dama-sand bg-white">
            {(stats?.topSellingItems ?? []).length > 0 ? (
              stats!.topSellingItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dama-ivory text-xs font-semibold text-dama-charcoal/50">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dama-charcoal">{item.name}</p>
                    <p className="text-xs text-dama-charcoal/50">{formatPrice(item.revenue)} revenue</p>
                  </div>
                  <span className="text-sm font-semibold text-dama-green-600">{item.quantity} sold</span>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-dama-charcoal/50">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dama-charcoal">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-dama-green-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-dama-sand bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dama-sand">
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Order</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Date</th>
                <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Total</th>
                <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dama-sand/50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-dama-ivory/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-dama-green-600 hover:underline">
                      {order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-dama-charcoal">{order.customer_name}</td>
                  <td className="px-4 py-3 text-dama-charcoal/60">
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-dama-charcoal">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
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
