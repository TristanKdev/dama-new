'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile, type Profile } from '@/lib/queries';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate } from '@/lib/utils';

interface RecentOrder {
  id: string;
  status: string;
  total: number;
  deliveryDate: string;
  createdAt: string;
  items: { menuItemName: string; quantity: number }[];
}

export default function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const saveMessageTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => {
      setProfile(p);
      if (p) {
        setEditName(p.full_name || '');
        setEditPhone(p.phone || '');
        setEditAddress(p.delivery_address || '');
      }
    }).catch(() => {});
    // Fetch recent orders
    fetch('/api/orders/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email?.toLowerCase() }),
    })
      .then((r) => r.ok ? r.json() : { orders: [] })
      .then((data) => setRecentOrders((data.orders || []).slice(0, 5)))
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateProfile(user.id, {
        full_name: editName,
        phone: editPhone,
        delivery_address: editAddress,
      });
      setProfile((prev) => prev ? {
        ...prev,
        full_name: editName,
        phone: editPhone,
        delivery_address: editAddress,
      } : prev);
      setIsEditing(false);
      setSaveMessage('Profile updated.');
      saveMessageTimerRef.current = setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-dama-cream py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">My Account</h1>
        <p className="mt-2 text-base text-dama-charcoal/60">Manage your orders and subscription.</p>

        {/* Recent Orders */}
        <div className="mt-8 rounded-lg bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dama-charcoal">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm font-medium text-dama-green-600 hover:underline">
              View All Orders
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="mt-4 divide-y divide-dama-sand">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-dama-charcoal">
                      {order.items.map((i) => `${i.menuItemName} x${i.quantity}`).join(', ')}
                    </p>
                    <p className="text-xs text-dama-charcoal/50">
                      {formatDate(order.deliveryDate)} &middot;{' '}
                      <span className="capitalize">{order.status}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-dama-charcoal">{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-dama-charcoal/50">No orders yet. Browse our menu to get started!</p>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link href="/account/orders" className="group rounded-lg border border-dama-sand bg-white p-6 transition-shadow hover:shadow-md">
            <h2 className="text-lg font-semibold text-dama-charcoal group-hover:text-dama-green-600">Order History</h2>
            <p className="mt-2 text-sm text-dama-charcoal/60">View your past orders and reorder favorites.</p>
          </Link>
          <Link href="/account/subscription" className="group rounded-lg border border-dama-sand bg-white p-6 transition-shadow hover:shadow-md">
            <h2 className="text-lg font-semibold text-dama-charcoal group-hover:text-dama-green-600">Subscription</h2>
            <p className="mt-2 text-sm text-dama-charcoal/60">Manage your weekly banchan subscription.</p>
          </Link>
        </div>

        {/* Profile */}
        <div className="mt-8 rounded-lg bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dama-charcoal">Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-dama-green-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {saveMessage && (
            <div className="mt-3 rounded-md bg-dama-green-50 p-2 text-sm text-dama-green-700">
              {saveMessage}
            </div>
          )}

          {isEditing ? (
            <div className="mt-4 space-y-4">
              <Input
                id="editName"
                label="Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dama-charcoal">Email</label>
                <p className="text-sm text-dama-charcoal/50">{user?.email}</p>
              </div>
              <Input
                id="editPhone"
                label="Phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
              <Input
                id="editAddress"
                label="Delivery Address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
              <div className="flex gap-3">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-dama-charcoal/50">Name</p>
                <p className="mt-0.5 text-sm text-dama-charcoal">{profile?.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-dama-charcoal/50">Email</p>
                <p className="mt-0.5 text-sm text-dama-charcoal">{user?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-dama-charcoal/50">Phone</p>
                <p className="mt-0.5 text-sm text-dama-charcoal">{profile?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-dama-charcoal/50">Delivery Address</p>
                <p className="mt-0.5 text-sm text-dama-charcoal">{profile?.delivery_address || '—'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
