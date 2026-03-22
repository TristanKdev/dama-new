import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getOrderById } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { DELIVERY, BUSINESS } from '@/lib/constants';
import { isValidUUID } from '@/lib/validation';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const TIMELINE_STEPS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
] as const;

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        This order has been cancelled
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.findIndex(s => s.key === status);
  // For pending, nothing is completed yet
  const activeIndex = status === 'pending' ? -1 : currentIndex;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-dama-green-500 text-white'
                      : 'border-2 border-dama-sand bg-white text-dama-charcoal/50'
                  } ${isCurrent ? 'ring-2 ring-dama-green-200 ring-offset-2' : ''}`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`mt-2 text-center text-[11px] leading-tight ${isCompleted ? 'font-medium text-dama-charcoal' : 'text-dama-charcoal/60'}`}>
                  {step.label}
                </span>
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`mx-1 mb-5 h-0.5 flex-1 ${idx < activeIndex ? 'bg-dama-green-500' : 'bg-dama-sand'}`} />
              )}
            </div>
          );
        })}
      </div>
      {status === 'pending' && (
        <p className="mt-3 text-center text-xs text-yellow-700">Your order is being reviewed and will be confirmed shortly.</p>
      )}
    </div>
  );
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validate the ID format to prevent unnecessary DB lookups
  if (!id || !isValidUUID(id)) {
    return (
      <div className="bg-dama-cream py-24">
        <div className="mx-auto max-w-lg px-4 text-center md:px-6">
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Invalid Order Link</h1>
          <Link href="/menu" className="mt-6 inline-block">
            <Button>Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use service role client since RLS restricts anonymous reads
  const serviceClient = createServiceRoleClient();
  const order = await getOrderById(id, serviceClient).catch(() => null);

  if (!order) {
    return (
      <div className="bg-dama-cream py-24">
        <div className="mx-auto max-w-lg px-4 text-center md:px-6">
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Order Not Found</h1>
          <p className="mt-3 text-base text-dama-charcoal/70">
            We couldn&apos;t find an order with that ID. It may have been removed or the link is incorrect.
          </p>
          <Link href="/menu" className="mt-6 inline-block">
            <Button>Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dama-cream py-24">
      <div className="mx-auto max-w-lg px-4 text-center md:px-6">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-dama-green-100">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" className="text-dama-green-600">
            <path d="M8 16l5 5 11-11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">
          {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Confirmed!'}
        </h1>
        <p className="mt-3 text-base text-dama-charcoal/70">
          {order.status === 'cancelled'
            ? `${order.customerName.split(' ')[0] || 'There'}, this order has been cancelled.`
            : `Thank you, ${order.customerName.split(' ')[0] || 'there'}! We're preparing everything fresh for you.`}
        </p>

        <div className="mt-4 rounded-md bg-dama-green-50 px-4 py-3 text-sm text-dama-green-700">
          {order.deliveryMethod === 'building-delivery' ? (
            <p>Your order will be delivered on{' '}
              <span className="font-semibold">{new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              {' '}between <span className="font-semibold">{DELIVERY.hours}</span> to your building lobby.
            </p>
          ) : (
            <p>Your order will be ready for pickup on{' '}
              <span className="font-semibold">{new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              {' '}at <span className="font-semibold">{BUSINESS.pickupLocation.name}</span> ({BUSINESS.pickupLocation.address}).
            </p>
          )}
        </div>

        {/* Status Timeline */}
        <div className="mt-8 rounded-lg bg-white p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">Order Status</h2>
          <OrderTimeline status={order.status} />
        </div>

        <div className="mt-4 rounded-lg bg-white p-6 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal">Order Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dama-charcoal/60">Order Number</span>
              <span className="font-medium text-dama-charcoal">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dama-charcoal/60">Delivery Date</span>
              <span className="font-medium text-dama-charcoal">
                {new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dama-charcoal/60">Delivery Method</span>
              <span className="font-medium text-dama-charcoal">
                {order.deliveryMethod === 'building-delivery' ? 'Building Delivery' : 'Pickup'}
              </span>
            </div>
            <hr className="border-dama-sand" />
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-dama-charcoal/70">{item.menuItem.nameEn} x{item.quantity}</span>
                <span className="font-medium">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <hr className="border-dama-sand" />
            <div className="flex justify-between text-sm">
              <span className="text-dama-charcoal/60">Subtotal</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dama-charcoal/60">Delivery</span>
              <span className="font-medium">{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-dama-charcoal">Total</span>
              <span className="text-dama-charcoal">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/menu">
            <Button>Continue Shopping</Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="secondary">View Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
