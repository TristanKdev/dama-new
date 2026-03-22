'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getSubscriptionByUserId } from '@/lib/queries';
import type { Subscriber } from '@/types/subscription';

export default function SubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscriber | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [skipMessage, setSkipMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    getSubscriptionByUserId(user.id)
      .then((sub) => setSubscription(sub))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, authLoading]);

  const updateStatus = async (newStatus: 'active' | 'paused' | 'cancelled') => {
    if (!subscription) return;
    setUpdating(true);
    setStatusError('');
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSubscription(prev => prev ? {
          ...prev,
          status: newStatus,
          pausedAt: newStatus === 'paused' ? new Date().toISOString() : prev.pausedAt,
          cancelledAt: newStatus === 'cancelled' ? new Date().toISOString() : prev.cancelledAt,
        } : null);
        setShowCancelConfirm(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusError(data.error || 'Failed to update subscription');
      }
    } catch {
      setStatusError('Network error — please try again');
    } finally {
      setUpdating(false);
    }
  };

  const skipNextDelivery = async () => {
    if (!subscription) return;
    setSkipping(true);
    setSkipMessage('');
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}/skip`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(prev => prev ? { ...prev, nextDeliveryDate: data.nextDeliveryDate } : null);
        setSkipMessage('Next delivery skipped successfully!');
        setTimeout(() => setSkipMessage(''), 4000);
      } else {
        const data = await res.json();
        setSkipMessage(data.error || 'Failed to skip delivery');
      }
    } catch {
      setSkipMessage('Failed to skip delivery');
    } finally {
      setSkipping(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="bg-dama-cream py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <p className="text-sm text-dama-charcoal/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-dama-cream py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">My Subscription</h1>
          <p className="mt-4 text-dama-charcoal/70">Please log in to view your subscription.</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-dama-cream py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <Link href="/account" className="text-sm text-dama-green-600 hover:underline">&larr; Back to Account</Link>
          <h1 className="mt-4 font-cormorant text-3xl font-semibold text-dama-charcoal">My Subscription</h1>
          <div className="mt-8 rounded-lg border border-dama-sand bg-white p-8 text-center">
            <p className="text-dama-charcoal/70">You don&apos;t have an active subscription yet.</p>
            <p className="mt-2 text-sm text-dama-charcoal/50">
              Get fresh banchan delivered on your schedule. Save 10% compared to ordering à la carte.
            </p>
            <Link href="/subscribe" className="mt-6 inline-block">
              <Button>Start a Subscription</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    active: 'bg-dama-green-100 text-dama-green-700',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-dama-cream py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <Link href="/account" className="text-sm text-dama-green-600 hover:underline">&larr; Back to Account</Link>
        <h1 className="mt-4 font-cormorant text-3xl font-semibold text-dama-charcoal">My Subscription</h1>

        <div className="mt-8 rounded-lg border-2 border-dama-green-500 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[subscription.status] || 'bg-gray-100 text-gray-800'}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
              <h2 className="mt-2 text-xl font-semibold text-dama-charcoal">{subscription.planName}</h2>
              <p className="mt-1 text-sm text-dama-charcoal/60">5–6 seasonal banchan, chef&apos;s choice</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-dama-green-600">${subscription.pricePerDelivery}</p>
              <p className="text-xs text-dama-charcoal/50">per delivery</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-dama-charcoal/50">Frequency</p>
              <p className="mt-0.5 text-sm text-dama-charcoal">
                {subscription.frequency === 'weekly' ? 'Every week' : 'Every other week'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-dama-charcoal/50">Delivery Day</p>
              <p className="mt-0.5 text-sm text-dama-charcoal">{subscription.deliveryDay}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-dama-charcoal/50">Next Delivery</p>
              <p className="mt-0.5 text-sm text-dama-charcoal">
                {subscription.status === 'active' && subscription.nextDeliveryDate
                  ? new Date(subscription.nextDeliveryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : subscription.status === 'paused' ? 'Paused' : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-dama-charcoal/50">Delivery Address</p>
              <p className="mt-0.5 text-sm text-dama-charcoal">{subscription.deliveryAddress}</p>
            </div>
          </div>

          {statusError && (
            <div className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
              {statusError}
            </div>
          )}

          {skipMessage && (
          <div className={`mt-4 rounded-md px-4 py-2 text-sm ${skipMessage.includes('success') ? 'bg-dama-green-50 text-dama-green-700' : 'bg-red-50 text-red-700'}`}>
            {skipMessage}
          </div>
        )}

        {subscription.status !== 'cancelled' && (
            <div className="mt-6 flex flex-wrap gap-3">
              {subscription.status === 'active' && (
                <>
                  <Button variant="secondary" size="sm" disabled={skipping} onClick={skipNextDelivery}>
                    {skipping ? 'Skipping...' : 'Skip Next Delivery'}
                  </Button>
                  <Button variant="secondary" size="sm" disabled={updating} onClick={() => updateStatus('paused')}>
                    {updating ? 'Updating...' : 'Pause Subscription'}
                  </Button>
                </>
              )}
              {subscription.status === 'paused' && (
                <Button size="sm" disabled={updating} onClick={() => updateStatus('active')}>
                  {updating ? 'Updating...' : 'Resume Subscription'}
                </Button>
              )}
              {!showCancelConfirm ? (
                <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(true)}>
                  Cancel
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Are you sure?</span>
                  <Button variant="ghost" size="sm" disabled={updating} onClick={() => updateStatus('cancelled')}>
                    {updating ? 'Cancelling...' : 'Yes, Cancel'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowCancelConfirm(false)}>
                    No, Keep It
                  </Button>
                </div>
              )}
            </div>
          )}

          {subscription.status === 'cancelled' && (
            <div className="mt-6">
              <p className="text-sm text-dama-charcoal/50">
                Cancelled on {subscription.cancelledAt
                  ? new Date(subscription.cancelledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'N/A'}
              </p>
              <Link href="/subscribe" className="mt-3 inline-block">
                <Button size="sm">Start a New Subscription</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
