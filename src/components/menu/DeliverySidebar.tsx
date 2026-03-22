import { DELIVERY, BUSINESS } from '@/lib/constants';
import Link from 'next/link';

export function DeliverySidebar() {
  return (
    <aside className="rounded-lg border border-dama-sand/50 bg-white p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
        Delivery Info
      </h3>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-dama-charcoal/50">Delivery Days</p>
          <p className="mt-0.5 text-sm text-dama-charcoal">{DELIVERY.days.join(', ')}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-dama-charcoal/50">Delivery Hours</p>
          <p className="mt-0.5 text-sm text-dama-charcoal">{DELIVERY.hours}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-dama-charcoal/50">Order Cutoff</p>
          <p className="mt-0.5 text-sm text-dama-charcoal">{DELIVERY.cutoffNote}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-dama-charcoal/50">Delivery Fee</p>
          <p className="mt-0.5 text-sm text-dama-charcoal">
            Free on orders over ${DELIVERY.freeDeliveryMinimum}. Otherwise ${DELIVERY.deliveryFee}.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-dama-charcoal/50">Pickup Available</p>
          <p className="mt-0.5 text-sm text-dama-charcoal">
            {BUSINESS.pickupLocation.name}<br />
            {BUSINESS.pickupLocation.address}
          </p>
        </div>

        <hr className="border-dama-sand" />

        <div className="space-y-2">
          <Link
            href="/delivery-areas"
            className="block text-sm text-dama-green-600 hover:text-dama-green-700 hover:underline"
          >
            View delivery areas →
          </Link>
          <Link
            href="/faq"
            className="block text-sm text-dama-green-600 hover:text-dama-green-700 hover:underline"
          >
            FAQs →
          </Link>
        </div>
      </div>
    </aside>
  );
}
