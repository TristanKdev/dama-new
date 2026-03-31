'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

const EVENT_TYPES = [
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'wedding', label: 'Wedding / Reception' },
  { value: 'holiday', label: 'Holiday Gathering' },
  { value: 'housewarming', label: 'Housewarming' },
  { value: 'other', label: 'Other' },
];

export default function CateringPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    eventType: '',
    dietaryRestrictions: '',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    const guestNum = parseInt(formData.guestCount, 10);
    if (isNaN(guestNum) || guestNum < 10) {
      setError('Minimum 10 guests required for catering.');
      setLoading(false);
      return;
    }
    if (!formData.eventType) {
      setError('Please select an event type.');
      setLoading(false);
      return;
    }
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (formData.eventDate < today) {
      setError('Event date must be in the future.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/catering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-dama-cream py-24">
        <div className="mx-auto max-w-lg px-4 text-center md:px-6">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-dama-green-100">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" className="text-dama-green-600">
              <path d="M8 16l5 5 11-11" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Inquiry Submitted!</h1>
          <p className="mt-3 text-base text-dama-charcoal/70">
            Thank you for your catering inquiry. We&apos;ll review your request and get back to you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dama-cream">
      {/* Hero */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="w-full text-center md:w-1/2 md:text-left">
              <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Party DAM:A</p>
              <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
                Korean Catering for Every Occasion
              </h1>
              <p className="mt-4 text-base leading-relaxed text-dama-charcoal/70">
                Party DAM:A is a premium Korean catering format. No buffet lines. No self-serve trays. A curated Korean table — individually packed, open-and-serve ready. We bring the full DAM:A experience to your event.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
                <Image
                  src="/images/photo/branded-box-overhead.jpg"
                  alt="DAM:A branded dosirak box with banchan and rice"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What is Party DAM:A */}
      <div className="mx-auto max-w-5xl px-4 pt-16 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
            What is Party DAM:A?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-dama-charcoal/70">
            Party DAM:A is a premium Korean catering format. No buffet lines. No self-serve trays. A curated Korean table — individually packed, open-and-serve ready.
          </p>
        </div>
      </div>

      {/* Catering photo */}
      <div className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
          <Image
            src="/images/photo/banchan-glass-trays.jpg"
            alt="DAM:A banchan selection in glass trays"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      </div>

      {/* Three Package Options */}
      <div className="mx-auto max-w-5xl px-4 pt-16 md:px-6">
        <h2 className="mb-8 text-center font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
          Our Catering Packages
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Meeting DAM:A Box */}
          <div className="rounded-2xl border border-dama-sand/50 bg-white p-6">
            <h3 className="text-lg font-bold text-dama-charcoal">Meeting DAM:A Box</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-dama-green-600">For corporate offices and institutional meetings</p>
            <p className="mt-1 text-sm font-semibold text-dama-charcoal">10 – 120 guests</p>
            <p className="mt-3 text-sm leading-relaxed text-dama-charcoal/60">
              A clean, professional Korean meal format designed for the workplace. Individually packed dosirak boxes and curated banchan selections — no shared platters, no mess. Each guest receives their own complete Korean table. Ideal for corporate lunches, team meetings, and office events.
            </p>
            <div className="mt-4 rounded-lg bg-dama-cream/60 p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-dama-charcoal/50">What&apos;s Included</p>
              <ul className="space-y-0.5 text-xs text-dama-charcoal/70">
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Individual dosirak boxes per guest</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Curated banchan selection</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Dietary accommodations available</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Delivery to your building</li>
              </ul>
            </div>
          </div>

          {/* Party DAM:A Box */}
          <div className="rounded-2xl border border-dama-green-200 bg-dama-green-50/30 p-6">
            <h3 className="text-lg font-bold text-dama-charcoal">Party DAM:A Box</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-dama-green-600">For private events, birthdays, and rooftop parties</p>
            <p className="mt-1 text-sm font-semibold text-dama-charcoal">10 – 150 guests</p>
            <p className="mt-3 text-sm leading-relaxed text-dama-charcoal/60">
              Our signature catering format for private celebrations. A full Korean table experience — curated banchan spreads, signature mains including our Beef Short Rib Galbi (Tteokgalbi / 떡갈비), and seasonal specialties. Individually packed and open-and-serve ready. Perfect for birthdays, housewarmings, rooftop gatherings, and private parties.
            </p>
            <div className="mt-4 rounded-lg bg-white/60 p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-dama-charcoal/50">What&apos;s Included</p>
              <ul className="space-y-0.5 text-xs text-dama-charcoal/70">
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Signature Tteokgalbi (Beef Short Rib Galbi)</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Full banchan spread</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Seasonal specialties</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Individually packed, open-and-serve ready</li>
              </ul>
            </div>
          </div>

          {/* Cocktail / Anju DAM:A Box */}
          <div className="rounded-2xl border border-dama-sand/50 bg-white p-6">
            <h3 className="text-lg font-bold text-dama-charcoal">Cocktail / Anju DAM:A Box</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-dama-green-600">For hotel receptions, gallery openings, and corporate cocktail hours</p>
            <p className="mt-1 text-sm font-semibold text-dama-charcoal">10 – 150 guests</p>
            <p className="mt-3 text-sm leading-relaxed text-dama-charcoal/60">
              A sophisticated Korean anju spread designed for cocktail-style events. Anju (안주) are Korean bar snacks — bold, flavorful bites that pair perfectly with drinks. Our cocktail format brings Korean bar culture to your reception, gallery opening, or corporate cocktail hour. Elegant, shareable, and deeply satisfying.
            </p>
            <div className="mt-4 rounded-lg bg-dama-cream/60 p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-dama-charcoal/50">What&apos;s Included</p>
              <ul className="space-y-0.5 text-xs text-dama-charcoal/70">
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Korean anju selection (Jeon, Mandu, Seasoned Squid, and more)</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Seasonal small bites</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Presentation-ready packaging</li>
                <li className="flex items-start gap-1.5"><span className="mt-0.5 text-dama-green-500">&#8226;</span>Pairs perfectly with any drink menu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
        <div className="flex flex-col gap-12 md:flex-row">
          {/* Form */}
          <div className="flex-1">
            <h2 className="mb-2 font-cormorant text-2xl font-semibold text-dama-charcoal">Request a Catering Quote</h2>
            <p className="mb-6 text-sm text-dama-charcoal/60">Tell us about your event and we&apos;ll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-dama-error">{error}</div>
              )}
              <Input
                id="name"
                label="Name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                id="phone"
                label="Phone"
                type="tel"
                placeholder="(201) 555-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                id="eventDate"
                label="Event Date"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
              <Input
                id="guestCount"
                label="Number of Guests"
                type="number"
                placeholder="Minimum 10"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                required
              />
              <Select
                id="eventType"
                label="Event Type"
                placeholder="Select event type"
                options={EVENT_TYPES}
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                required
              />
              <div>
                <label htmlFor="dietaryRestrictions" className="mb-1.5 block text-sm font-medium text-dama-charcoal">
                  Dietary Restrictions (optional)
                </label>
                <textarea
                  id="dietaryRestrictions"
                  rows={2}
                  placeholder="Any allergies or dietary requirements..."
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  className="w-full rounded-md border border-dama-sand bg-white px-4 py-3 text-dama-charcoal placeholder:text-dama-sand transition-colors focus:border-dama-green-400 focus:outline-none focus:ring-2 focus:ring-dama-green-400/20"
                />
              </div>
              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-dama-charcoal">
                  Additional Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Tell us about your event..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-md border border-dama-sand bg-white px-4 py-3 text-dama-charcoal placeholder:text-dama-sand transition-colors focus:border-dama-green-400 focus:outline-none focus:ring-2 focus:ring-dama-green-400/20"
                />
              </div>
              <Button type="submit" disabled={loading} size="lg">
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </form>
          </div>

          {/* Sidebar info */}
          <div className="w-full md:w-72">
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal">Catering Info</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Minimum Guests</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">10 people</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Lead Time</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">Minimum 1 week advance notice required.</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Delivery Area</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">Jersey City and surrounding areas.</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Pricing</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">Contact us for a custom quote.</p>
                </div>
                <hr className="border-dama-sand" />
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Questions?</p>
                  <a href={`mailto:${BUSINESS.email}`} className="mt-0.5 text-sm text-dama-green-600 hover:underline">
                    {BUSINESS.email}
                  </a>
                  <br />
                  <a href={`tel:${BUSINESS.phone.replace(/[^+\d]/g, '')}`} className="mt-0.5 text-sm text-dama-green-600 hover:underline">
                    {BUSINESS.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
