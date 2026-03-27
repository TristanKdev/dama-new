import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-dama-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 md:flex-row md:px-6 md:py-24">
        {/* Left text — 60% */}
        <div className="w-full md:w-[60%] md:pr-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-dama-green-600">
            Simply Wholesome
          </p>
          <h1 className="font-cormorant text-4xl font-semibold leading-tight text-dama-charcoal md:text-5xl lg:text-6xl">
            Balanced Korean
            <br />
            Meals That
            <br />
            <span className="text-dama-green-500">Nourish Your Day</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-dama-charcoal/70">
            DAM:A (담아) means &ldquo;to contain&rdquo; — we contain wellness in every bite.
            Fresh banchan and dosirak, thoughtfully prepared and delivered to your door in Jersey City.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu">
              <Button size="lg">View This Week&apos;s Menu</Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="secondary" size="lg">How It Works</Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-dama-charcoal/50">
            Delivering to select buildings in Downtown JC, Waterfront &amp; Journal Square
          </p>
        </div>

        {/* Right image — 40% */}
        <div className="mt-10 w-full md:mt-0 md:w-[40%]">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
            <Image
              src="/images/hero.jpg"
              alt="Korean dosirak meal box with compartments of banchan, rice, and kimchi"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
