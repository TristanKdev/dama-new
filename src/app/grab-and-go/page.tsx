import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Grab & Go — Fresh Korean Banchan for Pickup',
  description:
    'Fresh Korean banchan available for same-day pickup. Coming soon — check back for updates.',
};

export default function GrabAndGoPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-noto-kr text-sm text-dama-green-600">포장</p>
      <h1 className="mt-1 font-cormorant text-4xl font-semibold text-dama-charcoal md:text-5xl">
        Grab &amp; Go
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-dama-charcoal/60">
        Fresh Korean banchan available for same-day pickup. Coming soon — check back for updates.
      </p>
      <Link
        href="/menu"
        className="mt-8 inline-flex rounded-md bg-dama-green-500 px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-dama-green-600"
      >
        Browse Our Menu
      </Link>
    </section>
  );
}
