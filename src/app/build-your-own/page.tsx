'use client';

import { TrayBuilder } from '@/components/tray/TrayBuilder';

export default function BuildYourOwnPage() {
  return (
    <div className="bg-dama-cream">
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Build Your Own</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            Custom Dosirak Box
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            Choose your box size, then fill each slot with your favorite banchan from our selection of 30 authentic Korean side dishes.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 md:px-6 md:pb-24">
        <TrayBuilder />
      </div>
    </div>
  );
}
