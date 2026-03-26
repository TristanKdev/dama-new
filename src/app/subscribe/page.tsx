import Link from 'next/link';

export default function SubscribePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-dama-cream px-4 py-24">
      <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
        Coming Soon
      </h1>
      <p className="mt-4 max-w-md text-center text-base leading-relaxed text-dama-charcoal/70">
        Our subscription service is being refreshed. Check back soon for weekly Korean meal delivery with savings.
      </p>
      <Link
        href="/menu"
        className="mt-8 inline-block rounded-full bg-dama-green-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dama-green-700"
      >
        Browse Our Menu
      </Link>
    </div>
  );
}
