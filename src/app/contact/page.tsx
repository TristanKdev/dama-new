'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
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
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Message Sent!</h1>
          <p className="mt-3 text-base text-dama-charcoal/70">
            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dama-cream">
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Get in Touch</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            Have a question, feedback, or catering inquiry? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="flex flex-col gap-12 md:flex-row">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
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
              <Select
                id="subject"
                label="Subject"
                placeholder="Choose a subject"
                options={[
                  { value: 'general', label: 'General Inquiry' },
                  { value: 'order', label: 'Order Question' },
                  { value: 'delivery', label: 'Delivery Issue' },
                  { value: 'subscription', label: 'Subscription' },
                  { value: 'catering', label: 'Catering' },
                  { value: 'feedback', label: 'Feedback' },
                  { value: 'other', label: 'Other' },
                ]}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-dama-charcoal">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="How can we help?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full rounded-md border border-dama-sand bg-white px-4 py-3 text-dama-charcoal placeholder:text-dama-sand transition-colors focus:border-dama-green-400 focus:outline-none focus:ring-2 focus:ring-dama-green-400/20"
                />
              </div>
              <Button type="submit" disabled={loading} size="lg">
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Sidebar info */}
          <div className="w-full md:w-72">
            <div className="rounded-lg bg-white p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal">Contact Info</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Email</p>
                  <a href={`mailto:${BUSINESS.email}`} className="mt-0.5 text-sm text-dama-green-600 hover:underline">
                    {BUSINESS.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Phone</p>
                  <a href={`tel:${BUSINESS.phone.replace(/[^+\d]/g, '')}`} className="mt-0.5 text-sm text-dama-green-600 hover:underline">
                    {BUSINESS.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Location</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">
                    {BUSINESS.address.street}<br />
                    {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-dama-charcoal/50">Response Time</p>
                  <p className="mt-0.5 text-sm text-dama-charcoal">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
