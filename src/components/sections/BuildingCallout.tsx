import Link from 'next/link';
import { AddressChecker } from '@/components/ui/AddressChecker';

export function BuildingCallout() {
  return (
    <section className="bg-dama-ivory py-16 md:py-24" aria-labelledby="building-callout-heading">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 id="building-callout-heading" className="font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
          Do We Deliver to Your Building?
        </h2>
        <p className="mt-4 text-base text-dama-charcoal/70">
          We currently deliver to select residential buildings in Jersey City.
          Check if your address is eligible for direct building delivery.
        </p>
        <div className="mx-auto mt-8 max-w-lg">
          <AddressChecker />
        </div>
        <p className="mt-6 text-sm text-dama-charcoal/50">
          Don&apos;t see your building?{' '}
          <Link href="/delivery-areas" className="text-dama-green-600 underline hover:text-dama-green-700">
            View all delivery areas
          </Link>{' '}
          or try our{' '}
          <Link href="/pickup" className="text-dama-green-600 underline hover:text-dama-green-700">
            pickup option
          </Link>.
        </p>
      </div>
    </section>
  );
}
