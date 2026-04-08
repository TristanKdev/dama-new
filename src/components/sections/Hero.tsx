'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const HERO_IMAGES = [
  { src: '/images/food/dosirak-chicken-set.jpg', alt: 'DAMA Chicken Set with sweet & tangy chicken and banchan' },
  { src: '/images/food/dosirak-pork-set.jpg', alt: 'DAMA Spicy Pork Set with multigrain rice and banchan' },
  { src: '/images/food/dosirak-beef-set.jpg', alt: 'DAMA Beef Set with bulgogi and seasonal banchan' },
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative overflow-hidden bg-dama-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-4 md:flex-row md:gap-2 md:px-6 md:py-6">
        {/* Left text — 55% */}
        <div className="flex w-full flex-col items-center text-center md:w-[55%]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-dama-green-600">
            Simply Wholesome
          </p>
          <h1 className="font-cormorant text-6xl font-bold leading-[1.05] text-dama-charcoal md:text-7xl lg:text-8xl">
            Balanced Korean
            <br />
            Meals That
            <br />
            <span className="text-dama-green-500">Nourish.</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-dama-charcoal/70">
            DAM:A (담아) means &ldquo;to contain&rdquo; — we contain wellness in every bite.
            Fresh banchan and dosirak, thoughtfully prepared and delivered to your door in Jersey City.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu">
              <Button size="lg">View This Week&apos;s Menu</Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="secondary" size="lg">How It Works</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-dama-charcoal/50">
            Delivering to select buildings in Downtown JC, Waterfront &amp; Journal Square
          </p>
        </div>

        {/* Right image carousel — 45% */}
        <div className="mt-8 w-full md:mt-0 md:w-[45%]">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-dama-sand/20 p-4">
            {HERO_IMAGES.map((img, i) => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                fill
                className={cn(
                  'object-contain p-3 transition-opacity duration-700',
                  i === current ? 'opacity-100' : 'opacity-0'
                )}
                sizes="(max-width: 768px) 100vw, 45vw"
                priority={i === 0}
              />
            ))}
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    i === current
                      ? 'bg-white w-4'
                      : 'bg-white/50 hover:bg-white/70'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
