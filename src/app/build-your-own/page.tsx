'use client';

import { TrayBuilder } from '@/components/tray/TrayBuilder';

export default function BuildYourOwnPage() {
  return (
    <div className="bg-dama-cream">
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">BYOB</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            Build Your Own Banchan
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            Pick 4, 8, or 12 banchan from our selection of 30 authentic Korean side dishes. Mix and match your favorites.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 md:px-6 md:pb-24">
        <TrayBuilder />
      </div>
    </div>
  );
}
