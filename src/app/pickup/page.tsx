import type { Metadata } from 'next';
import Image from 'next/image';
import { BUSINESS, DELIVERY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Pickup Location',
  description: 'Pick up your DAM:A order from our kitchen at 16 Bright Street Unit H, Jersey City, NJ 07302. Available Tue, Thu, Sat.',
};

export default function PickupPage() {
  return (
    <div className="bg-dama-cream">
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Pickup</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            Pickup Location
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            Prefer to grab your order in person? Pick up from our kitchen — always free, no minimum order.
          </p>
        </div>
      </div>

      {/* Storefront image */}
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
          <Image
            src="/images/photo/branded-box-overhead.jpg"
            alt="DAM:A Simply Wholesome storefront in Jersey City"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Info */}
          <div className="rounded-lg bg-white p-8">
            <h2 className="text-lg font-semibold text-dama-charcoal">{BUSINESS.pickupLocation.name}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-dama-charcoal/50">Address</p>
                <p className="mt-0.5 text-sm text-dama-charcoal">{BUSINESS.pickupLocation.address}</p>
              </div>
              {BUSINESS.pickupLocation.hours && (
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Pickup Hours</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">{BUSINESS.pickupLocation.hours}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-dama-charcoal/50">Delivery Days</p>
                <p className="mt-0.5 text-sm text-dama-charcoal">{DELIVERY.days.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-dama-charcoal/50">Order Cutoff</p>
                <p className="mt-0.5 text-sm text-dama-charcoal">{DELIVERY.cutoffNote}</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="aspect-square overflow-hidden rounded-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2!2d-74.0431!3d40.7265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c250a54e12b3af%3A0xbf54d4f9b9e2a1a!2sNewark%20Ave%2C%20Jersey%20City%2C%20NJ!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DAM:A Kitchen pickup location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
