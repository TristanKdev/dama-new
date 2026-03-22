'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AddressChecker } from '@/components/ui/AddressChecker';
import { Accordion } from '@/components/ui/Accordion';
import { faqItems } from '@/data/faq-items';
import { useAuth } from '@/context/AuthContext';
import { getProfile } from '@/lib/queries';

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SquarePayments>;
    };
  }
}

interface SquarePayments {
  card: () => Promise<SquareCard>;
}

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
  destroy: () => Promise<void>;
}

const subscriptionFaqs = faqItems
  .filter(f => f.category === 'Subscriptions')
  .map(f => ({ id: f.id, title: f.question, content: f.answer }));

export default function SubscribePage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryDay: '',
    frequency: 'weekly',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const cardRef = useRef<SquareCard | null>(null);
  const isSubmittingRef = useRef(false);

  // Pre-fill from profile if logged in
  useEffect(() => {
    if (user) {
      getProfile(user.id).then((p) => {
        if (p) {
          setFormData(prev => ({
            ...prev,
            name: p.full_name || prev.name,
            email: user.email || prev.email,
            phone: p.phone || prev.phone,
            address: p.delivery_address || prev.address,
          }));
        } else if (user.email) {
          setFormData(prev => ({ ...prev, email: user.email! }));
        }
      }).catch(() => {
        if (user.email) {
          setFormData(prev => ({ ...prev, email: user.email! }));
        }
      });
    }
  }, [user]);

  // Initialize Square card form when SDK is ready and we're on step 3
  const initSquareCard = useCallback(async () => {
    if (!window.Square) return;

    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    if (!appId || !locationId) {
      setError('Payment is not configured. Please contact support.');
      return;
    }

    try {
      const payments = await window.Square.payments(appId, locationId);
      const card = await payments.card();
      await card.attach('#square-card-container');
      cardRef.current = card;
      setCardReady(true);
    } catch {
      setError('Failed to load payment form. Please refresh and try again.');
    }
  }, []);

  useEffect(() => {
    if (step === 3 && sdkReady) {
      initSquareCard();
    }
    return () => {
      if (cardRef.current) {
        cardRef.current.destroy().catch(() => {});
        cardRef.current = null;
        setCardReady(false);
      }
    };
  }, [step, sdkReady, initSquareCard]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (step < 3) {
      if (step === 1 && !formData.deliveryDay) {
        setError('Please select a delivery day.');
        return;
      }
      if (step === 2) {
        if (!formData.name || !formData.email || !formData.address) {
          setError('Please fill in your name, email, and delivery address.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address.');
          return;
        }
      }
      setStep(step + 1);
      return;
    }

    // Step 3: tokenize card, set up payment, then create subscription
    if (!cardRef.current || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // 1. Tokenize the card
      const tokenResult = await cardRef.current.tokenize();

      if (tokenResult.status !== 'OK' || !tokenResult.token) {
        const errorMessage = tokenResult.errors?.map((err) => err.message).join(', ') || 'Card verification failed. Please check your card details.';
        setError(errorMessage);
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      // 2. Create Square customer + card-on-file
      const setupRes = await fetch('/api/subscriptions/setup-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          customerEmail: formData.email,
          customerName: formData.name,
        }),
      });

      if (!setupRes.ok) {
        let errorMessage = 'Failed to save payment method. Please try again.';
        try {
          const data = await setupRes.json();
          if (data.error) errorMessage = data.error;
        } catch {
          // Response wasn't JSON
        }
        throw new Error(errorMessage);
      }

      const { customerId, cardId } = await setupRes.json();

      // 3. Create the subscription with Square IDs
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          deliveryDay: formData.deliveryDay,
          deliveryAddress: formData.address,
          frequency: formData.frequency,
          userId: user?.id,
          squareCustomerId: customerId,
          squareCardId: cardId,
        }),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to create subscription. Please try again.';
        try {
          const data = await res.json();
          if (data.error) errorMessage = data.error;
        } catch {
          // Response wasn't JSON
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  }

  const squareSdkUrl = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.web.squarecdn.com/v1/square.js'
    : 'https://web.squarecdn.com/v1/square.js';

  if (success) {
    return (
      <div className="bg-dama-cream">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-dama-green-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dama-green-600">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            Subscription Started!
          </h1>
          <p className="mt-4 text-dama-charcoal/70">
            Welcome to the Weekly Banchan Box! Your preferred delivery day is{' '}
            <span className="font-medium text-dama-charcoal">{formData.deliveryDay}</span>.
          </p>
          <p className="mt-2 text-sm text-dama-charcoal/50">
            We&apos;ll send a confirmation and payment details to {formData.email}.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {user && (
              <Link href="/account/subscription">
                <Button>Manage Subscription</Button>
              </Link>
            )}
            <Link href="/menu">
              <Button variant="secondary">Browse Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dama-cream">
      <Script
        src={squareSdkUrl}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      {/* Hero with image */}
      <div className="relative overflow-hidden bg-dama-green-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center gap-8 py-12 md:flex-row md:py-20">
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Subscribe & Save</p>
              <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
                Eat Well Every Week
              </h1>
              <p className="mt-4 text-base text-dama-charcoal/70">
                Get a curated selection of banchan delivered on your schedule. Save 10% compared to ordering à la carte.
              </p>
            </div>
            <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl md:max-w-sm">
              <Image
                src="/images/photo/dosirak-angled-dark.jpg"
                alt="DAM:A branded dosirak box with banchan and rice"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {/* Step indicators */}
        <div className="mb-10 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s ? 'bg-dama-green-500 text-white' : 'bg-dama-sand text-dama-charcoal/50'
              }`}>
                {s}
              </div>
              <span className={`hidden text-sm sm:inline ${step >= s ? 'text-dama-charcoal' : 'text-dama-charcoal/60'}`}>
                {s === 1 ? 'Plan' : s === 2 ? 'Details' : 'Payment'}
              </span>
              {s < 3 && <div className="mx-2 h-px w-8 bg-dama-sand" />}
            </div>
          ))}
        </div>

        {/* Plan card */}
        <div className="mb-8 rounded-lg border-2 border-dama-green-500 bg-white p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Weekly Banchan Box</h2>
              <p className="mt-1 text-sm text-dama-charcoal/60">5–6 rotating banchan, chef&apos;s choice</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-dama-green-600">$35</p>
              <p className="text-xs text-dama-charcoal/50">per delivery</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {['5–6 seasonal banchan items', 'Chef-curated, rotated weekly', 'Reusable glass containers', 'Free delivery to your building', 'Skip, pause, or cancel anytime'].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-dama-charcoal/70">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-dama-green-500">
                  <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step >= 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dama-charcoal">
                {step === 1 ? 'Choose Your Schedule' : 'Schedule'}
              </h3>
              <Select
                id="frequency"
                label="Frequency"
                options={[
                  { value: 'weekly', label: 'Every week' },
                  { value: 'biweekly', label: 'Every other week' },
                ]}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
              <Select
                id="deliveryDay"
                label="Preferred Delivery Day"
                placeholder="Select a day"
                options={[
                  { value: 'Tuesday', label: 'Tuesday' },
                  { value: 'Thursday', label: 'Thursday' },
                  { value: 'Saturday', label: 'Saturday' },
                ]}
                value={formData.deliveryDay}
                onChange={(e) => setFormData({ ...formData, deliveryDay: e.target.value })}
              />
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dama-charcoal">Your Information</h3>
              <Input
                id="name"
                label="Full Name"
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
              />
              <div>
                <p className="mb-2 text-sm font-medium text-dama-charcoal">Delivery Address</p>
                <AddressChecker
                  compact
                  onConfirm={(address) => setFormData(prev => ({ ...prev, address }))}
                />
                {formData.address && (
                  <p className="mt-2 text-xs text-dama-green-600">
                    Delivery address: {formData.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {step >= 3 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-dama-green-50 p-6">
                <h3 className="text-lg font-semibold text-dama-charcoal">Subscription Summary</h3>
                <p className="mt-2 text-sm text-dama-charcoal/70">
                  You&apos;re subscribing to the Weekly Banchan Box at $35/delivery, delivered every {formData.frequency === 'weekly' ? 'week' : 'other week'} on {formData.deliveryDay || 'your chosen day'}.
                </p>
                <p className="mt-1 text-sm text-dama-charcoal/70">
                  Delivery to: {formData.address}
                </p>
              </div>

              <div className="rounded-lg bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
                  Payment Method
                </h3>
                <p className="mb-4 text-sm text-dama-charcoal/60">
                  Your card will be charged $35 on each delivery day. You can cancel anytime.
                </p>
                <div id="square-card-container" className="min-h-[90px]" />
                {!cardReady && sdkReady && (
                  <div className="flex items-center justify-center py-4 text-sm text-dama-charcoal/50">
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading payment form...
                  </div>
                )}
                {!sdkReady && (
                  <div className="flex items-center justify-center py-4 text-sm text-dama-charcoal/50">
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading payment SDK...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
                Back
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || (step === 3 && !cardReady)}>
              {isSubmitting ? 'Processing...' : step < 3 ? 'Continue' : 'Start Subscription'}
            </Button>
          </div>
        </form>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="mb-6 font-cormorant text-2xl font-semibold text-dama-charcoal">
            Subscription FAQs
          </h2>
          <Accordion items={subscriptionFaqs} />
        </div>
      </div>
    </div>
  );
}
