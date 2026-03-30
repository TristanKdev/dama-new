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
      {/* Hero with image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/photo/branded-box-overhead.jpg"
            alt="A spread of Korean banchan dishes arranged for a catering event"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-dama-charcoal/50" />
        </div>
        <div className="relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
            <p className="text-sm font-medium uppercase tracking-wider text-dama-green-300">Events & Parties</p>
            <h1 className="mt-2 font-cormorant text-3xl font-semibold text-white md:text-5xl">
              Party DAM:A Catering
            </h1>
            <p className="mt-4 text-base text-white/80">
              Premium Korean catering for corporate events, private parties, and cocktail hours. Individually packed, open-and-serve ready. 10+ guests.
            </p>
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
            src="/images/photo/full-spread-4items.jpg"
            alt="DAM:A catering spread with individually packed Korean dishes"
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
        <div className="grid gap-6 md:grid-cols-3">
          {/* Meeting DAM:A Box */}
          <div className="rounded-2xl border border-dama-sand/50 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-dama-green-100">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dama-green-600">
                <rect x="2" y="4" width="16" height="12" rx="2" />
                <path d="M2 8h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dama-charcoal">Meeting DAM:A Box</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-dama-green-600">Corporate &amp; Institutional</p>
            <p className="mt-3 text-sm leading-relaxed text-dama-charcoal/60">
              Perfect for corporate offices and institutional meetings. Individually packed dosirak sets with curated banchan — professional, clean, and ready to serve.
            </p>
            <p className="mt-3 text-sm font-medium text-dama-charcoal">10–120 guests</p>
          </div>

          {/* Party DAM:A Box */}
          <div className="rounded-2xl border border-dama-green-200 bg-dama-green-50/30 p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-dama-green-100">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dama-green-600">
                <path d="M10 2l2 4h5l-4 3 1.5 5L10 11l-4.5 3L7 9 3 6h5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dama-charcoal">Party DAM:A Box</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-dama-green-600">Private Events &amp; Celebrations</p>
            <p className="mt-3 text-sm leading-relaxed text-dama-charcoal/60">
              For private events, birthdays, and rooftop parties. A full Korean table experience with our signature banchan spread and main dishes.
            </p>
            <p className="mt-3 text-sm font-medium text-dama-charcoal">10–150 guests</p>
          </div>

          {/* Cocktail / Anju DAM:A Box */}
          <div className="rounded-2xl border border-dama-sand/50 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-dama-green-100">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dama-green-600">
                <path d="M5 2l-2 8h14l-2-8H5z" />
                <path d="M10 10v6M6 16h8" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dama-charcoal">Cocktail / Anju DAM:A Box</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-dama-green-600">Receptions &amp; Cocktail Hours</p>
            <p className="mt-3 text-sm leading-relaxed text-dama-charcoal/60">
              For hotel receptions, gallery openings, and corporate cocktail hours. Elegant Korean anju (drinking snacks) paired with your event&apos;s beverage program.
            </p>
            <p className="mt-3 text-sm font-medium text-dama-charcoal">Custom guest count</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
        <div className="flex flex-col gap-12 md:flex-row">
          {/* Form */}
          <div className="flex-1">
            <h2 className="mb-6 font-cormorant text-2xl font-semibold text-dama-charcoal">Request a Quote</h2>
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
