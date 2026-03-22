import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { VesselDivider } from '@/components/ui/VesselDivider';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how DAM:A delivers fresh Korean banchan to your building in Jersey City. Order online, we deliver Tue/Thu/Sat.',
};

const timelineSteps = [
  { number: '01', title: 'Browse', description: 'Check this week\'s rotating menu of banchan and dosirak sets.', side: 'left' },
  { number: '02', title: 'Order', description: 'Add to cart, pick delivery date (Tue / Thu / Sat), check out by 10 PM.', side: 'right' },
  { number: '03', title: 'We Prepare', description: 'Our kitchen makes everything fresh the morning of delivery.', side: 'left' },
  { number: '04', title: 'Enjoy', description: 'Delivered to your building lobby in reusable containers. Return empties next time.', side: 'right' },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-dama-cream">
      {/* Hero */}
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            How It Works
          </h1>
          <p className="mt-4 text-lg text-dama-charcoal/70">
            From our kitchen to your table — fresh Korean meals, delivered to your building.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mx-auto max-w-4xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 hidden h-full w-px bg-dama-sand md:left-1/2 md:block" />

          <div className="space-y-12">
            {timelineSteps.map((step) => (
              <div key={step.number} className={`relative flex flex-col md:flex-row ${step.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                {/* Content */}
                <div className={`flex-1 ${step.side === 'left' ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <span className="font-cormorant text-4xl font-bold text-dama-green-400/30">{step.number}</span>
                  <h3 className="mt-1 text-xl font-semibold text-dama-charcoal">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-dama-charcoal/60">{step.description}</p>
                </div>
                {/* Center dot */}
                <div className="absolute left-4 top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-dama-green-500 md:left-1/2 md:block" />
                {/* Spacer */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial image break */}
      <div className="mx-auto max-w-5xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/images/photo/branded-box-angle.jpg"
              alt="DAM:A Simply Wholesome branded paper bag"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/images/photo/dosirak-overhead-full.jpg"
              alt="Freshly prepared dosirak box opened showing banchan"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/images/photo/banchan-glass-trays.jpg"
              alt="DAM:A branded eco tote bag with vegetable illustrations"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
      </div>

      <VesselDivider />

      {/* Delivery methods comparison */}
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="mb-10 text-center font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
            Delivery Options
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Building delivery */}
            <div className="rounded-lg border-2 border-dama-green-500 bg-white p-8">
              <span className="inline-block rounded-full bg-dama-green-100 px-3 py-1 text-xs font-medium text-dama-green-700">Most Popular</span>
              <h3 className="mt-4 text-xl font-semibold text-dama-charcoal">Building Delivery</h3>
              <p className="mt-2 text-sm text-dama-charcoal/60">Direct to your building lobby or concierge</p>
              <ul className="mt-4 space-y-2">
                {['Free on orders over $30', 'Tue, Thu, Sat: by 12:00 PM', 'Left with concierge/lobby', 'Insulated packaging', 'Order by 10 PM night before'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-dama-charcoal/70">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-dama-green-500">
                      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pickup */}
            <div className="rounded-lg border border-dama-sand bg-white p-8">
              <span className="inline-block rounded-full bg-dama-ivory px-3 py-1 text-xs font-medium text-dama-charcoal/60">Also Available</span>
              <h3 className="mt-4 text-xl font-semibold text-dama-charcoal">Pickup</h3>
              <p className="mt-2 text-sm text-dama-charcoal/60">Grab your order from our kitchen</p>
              <ul className="mt-4 space-y-2">
                {['Always free', '16 Bright Street Unit H, Jersey City, NJ 07302', 'No minimum order', 'Same cutoff: 10 PM night before'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-dama-charcoal/70">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-dama-green-500">
                      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Visual schedule */}
      <div className="bg-dama-ivory py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
            Weekly Schedule
          </h2>
          <div className="mt-8 grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
              const isDelivery = ['Tue', 'Thu', 'Sat'].includes(day);
              return (
                <div key={day} className={`rounded-lg py-4 ${isDelivery ? 'bg-dama-green-500 text-white' : 'bg-white text-dama-charcoal/60'}`}>
                  <p className="text-xs font-medium">{day}</p>
                  {isDelivery && <p className="mt-1 text-[10px]">Delivery</p>}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-dama-charcoal/50">Orders close at 10 PM the night before each delivery day.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-dama-green-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-3 text-base text-dama-charcoal/70">
            Browse this week&apos;s menu and place your first order.
          </p>
          <Link href="/menu" className="mt-6 inline-block">
            <Button size="lg">View Menu</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
