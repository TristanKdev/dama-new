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
              Catering &amp; Small Parties
            </h1>
            <p className="mt-4 text-base text-white/80">
              Let us bring the flavors of Korea to your next event. We cater gatherings of 10 or more guests with a custom banchan spread.
            </p>
          </div>
        </div>
      </div>

      {/* Venue preview */}
      <div className="mx-auto max-w-5xl px-4 pt-16 md:px-6">
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
          <Image
            src="/images/photo/full-spread-4items.jpg"
            alt="DAM:A outdoor patio dining area for events"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
        <div className="flex flex-col gap-12 md:flex-row">
          {/* Form */}
          <div className="flex-1">
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
                  <p className="text-xs font-medium text-dama-charcoal/50">What We Offer</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">
                    Custom banchan spreads, dosirak boxes, and seasonal specialties tailored to your event.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Lead Time</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">We recommend at least 1 week advance notice.</p>
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
