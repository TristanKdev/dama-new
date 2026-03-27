import Link from 'next/link';

export default function SubscribePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-dama-cream px-4 py-24">
      <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">
        Coming Soon
      </p>
      <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
        Subscribe &amp; Save
      </h1>
      <p className="mt-4 max-w-md text-center text-base leading-relaxed text-dama-charcoal/70">
        Our subscription service is coming soon. Check back for weekly banchan delivery options.
      </p>
      <Link
        href="/menu"
        className="mt-8 inline-block rounded-full bg-dama-green-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dama-green-700"
      >
        View This Week&apos;s Menu &rarr;
      </Link>
    </div>
  );
}
