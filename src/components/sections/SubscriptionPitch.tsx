import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export function SubscriptionPitch() {
  return (
    <section className="bg-dama-cream py-16 md:py-24" aria-labelledby="subscription-heading">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 md:flex-row md:px-6">
        {/* Image left — portrait */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
            <Image
              src="/images/photo/branded-box-angle.jpg"
              alt="DAM:A branded dosirak set with colorful banchan and rice"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Text right */}
        <div className="w-full md:w-1/2 md:pl-8">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">
            Subscribe &amp; Save
          </p>
          <h2 id="subscription-heading" className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            Eat Well Every Week
          </h2>
          <p className="mt-4 text-base leading-relaxed text-dama-charcoal/70">
            Get a curated selection of banchan delivered to your door every week or every other week.
            Our chef rotates the menu so you always discover something new. Pause or cancel anytime.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Curated by our chef, rotated weekly',
              'Choose your delivery day',
              'Skip, pause, or cancel anytime',
              'Save 10% compared to à la carte',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-dama-charcoal/70">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-dama-green-500">
                  <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/subscribe" className="mt-8 inline-block">
            <Button size="lg">Learn More</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
