'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useCartStore, type RegularCartItem } from '@/lib/cart-store';
import { useAuth } from '@/context/AuthContext';
import { getProfile, getMenuItemsByIds } from '@/lib/queries';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

type Step = 'info' | 'payment';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items, deliveryDate, deliveryMethod, deliveryAddress,
    getSubtotal, getDeliveryFee, getTotal, clearCart,
    promoCode, promoDiscount, applyPromo, clearPromo,
    updateItemPrices,
  } = useCartStore();

  const [step, setStep] = useState<Step>('info');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Use a ref to prevent double-submit race conditions (state updates are async)
  const isProcessingRef = useRef(false);
  // Stable idempotency key for Square payment — survives retries to prevent duplicate charges
  const paymentIdempotencyKey = useRef(crypto.randomUUID());

  // Check for stale prices — warn user if any menu item prices changed since adding to cart
  useEffect(() => {
    async function checkPrices() {
      const regularItems = items.filter((i): i is RegularCartItem => i.type === 'regular');
      if (regularItems.length === 0) return;

      const ids = regularItems.map(i => i.menuItem.id);
      try {
        const currentItems = await getMenuItemsByIds(ids);
        const currentPrices = new Map(currentItems.map(i => [i.id, i.price]));

        const changed = regularItems.filter(i => {
          const current = currentPrices.get(i.menuItem.id);
          return current !== undefined && current !== i.menuItem.price;
        });

        if (changed.length > 0) {
          // Update cart with current prices so payment amount matches server verification
          updateItemPrices(currentPrices);
          setPriceWarning(
            `Prices updated for: ${changed.map(i => i.menuItem.nameEn).join(', ')}. Your totals have been adjusted.${promoCode ? ' Please re-apply your promo code.' : ''}`
          );
        }
      } catch {
        // Don't block checkout if price check fails — server verifies anyway
      }
    }
    checkPrices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill from profile if logged in
  useEffect(() => {
    if (!user) return;
    setCustomerEmail(user.email || '');
    getProfile(user.id).then((profile) => {
      if (profile) {
        if (profile.full_name) setCustomerName(profile.full_name);
        if (profile.phone) setCustomerPhone(profile.phone);
      }
    });
  }, [user]);

  const cardRef = useRef<SquareCard | null>(null);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        applyPromo(data.code, data.discount, data.discountType, data.discountValue);
        setPromoInput('');
      } else {
        setPromoError(data.error || 'Invalid code');
      }
    } catch {
      setPromoError('Failed to validate code');
    } finally {
      setPromoLoading(false);
    }
  };

  const validateInfo = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.name = 'Name is required';
    if (!customerEmail.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) newErrors.email = 'Invalid email';
    if (!customerPhone.trim()) newErrors.phone = 'Phone is required';
    if (!deliveryDate) {
      newErrors.date = 'Delivery date is required — please go back to cart and select a date';
    }
    if (deliveryMethod === 'building-delivery' && !deliveryAddress?.trim()) {
      newErrors.address = 'Delivery address is required — please go back to cart and enter your building address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrderInSupabase = useCallback(async (paymentReference: string) => {
    // Re-validate items exist before order creation
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderPayload = {
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      deliveryDate,
      deliveryMethod,
      deliveryAddress: deliveryAddress || null,
      subtotal,
      deliveryFee,
      total,
      notes: notes || null,
      paymentReference,
      userId: user?.id || null,
      promoCode: promoCode || null,
      items: items.flatMap((item) => {
        if (item.type === 'tray') {
          return item.items.map((ti) => ({
            menuItemId: ti.menuItem.id,
            menuItemName: `[Tray ${item.traySize}] ${ti.menuItem.nameEn}`,
            quantity: ti.quantity,
            unitPrice: ti.menuItem.price,
            subtotal: ti.menuItem.price * ti.quantity,
          }));
        }
        return [{
          menuItemId: item.menuItem.id,
          menuItemName: item.menuItem.nameEn,
          quantity: item.quantity,
          unitPrice: item.menuItem.price,
          subtotal: item.menuItem.price * item.quantity,
        }];
      }),
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) throw new Error('Failed to create order');
    const { orderId } = await res.json();
    return orderId;
  }, [customerName, customerEmail, customerPhone, deliveryDate, deliveryMethod, deliveryAddress, subtotal, deliveryFee, total, notes, items, user, promoCode]);

  // Initialize Square card form when SDK is ready and we're on payment step
  const initSquareCard = useCallback(async () => {
    if (!window.Square) {
      setPaymentError('Payment system failed to load. Please refresh the page.');
      return;
    }

    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    if (!appId || !locationId) {
      setPaymentError('Payment is not configured. Please contact support.');
      return;
    }

    try {
      const payments = await window.Square.payments(appId, locationId);
      const card = await payments.card();
      await card.attach('#square-card-container');
      cardRef.current = card;
      setCardReady(true);
    } catch {
      setPaymentError('Failed to load payment form. Please refresh and try again.');
    }
  }, []);

  useEffect(() => {
    if (step === 'payment' && sdkReady) {
      initSquareCard();
    }
    // If SDK hasn't loaded after 10 seconds on payment step, show error
    let timeout: NodeJS.Timeout | undefined;
    if (step === 'payment' && !sdkReady) {
      timeout = setTimeout(() => {
        if (!sdkReady) {
          setPaymentError('Payment system is taking too long to load. Please refresh the page.');
        }
      }, 10000);
    }
    return () => {
      clearTimeout(timeout);
      if (cardRef.current) {
        cardRef.current.destroy().catch(() => {});
        cardRef.current = null;
        setCardReady(false);
      }
    };
  }, [step, sdkReady, initSquareCard]);

  const handleFreeOrder = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setPaymentError('');
    setIsProcessing(true);

    try {
      const orderId = await createOrderInSupabase('free-order');
      clearCart();
      router.push(`/order-confirmation/${orderId}`);
    } catch {
      setPaymentError('Failed to place your order. Please try again.');
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const handlePayment = async () => {
    // Use ref to prevent double-submit (immune to React batching delays)
    if (!cardRef.current || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setPaymentError('');
    setIsProcessing(true);

    try {
      // Tokenize the card
      const result = await cardRef.current.tokenize();

      if (result.status !== 'OK' || !result.token) {
        const errorMessage = result.errors?.map((e) => e.message).join(', ') || 'Card verification failed';
        setPaymentError(errorMessage);
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      // Send token to our API to create the payment
      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          amount: total,
          idempotencyKey: paymentIdempotencyKey.current,
          customerEmail: customerEmail.toLowerCase(),
          customerName,
        }),
      });

      if (!payRes.ok) {
        const payErr = await payRes.json();
        setPaymentError(payErr.error || 'Payment failed. Please try again.');
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      const { paymentId } = await payRes.json();

      // Create order in Supabase — if this fails, payment was already taken.
      // The idempotency key (paymentId as paymentReference) ensures retries
      // won't create duplicate orders.
      try {
        const orderId = await createOrderInSupabase(paymentId);
        // Reset idempotency key for any future checkout
        paymentIdempotencyKey.current = crypto.randomUUID();
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
      } catch {
        // Payment succeeded but order creation failed.
        // Don't reset isProcessing — show a specific message and allow retry.
        // The paymentReference idempotency check in createOrder prevents duplicates.
        setPaymentError(
          'Your payment was processed but we had trouble saving your order. ' +
          'Please try again — you will not be charged twice.'
        );
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    } catch {
      setPaymentError('An error occurred processing your payment. Please try again.');
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const handleContinueToPayment = () => {
    if (!validateInfo()) return;
    setStep('payment');
  };

  if (items.length === 0) return null;

  const squareSdkUrl = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.web.squarecdn.com/v1/square.js'
    : 'https://web.squarecdn.com/v1/square.js';

  return (
    <div className="bg-dama-cream">
      <Script
        src={squareSdkUrl}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => setPaymentError('Payment system failed to load. Please refresh the page.')}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <Link href="/cart" className="text-sm text-dama-green-600 hover:underline">
          &larr; Back to Cart
        </Link>
        <h1 className="mt-4 font-cormorant text-3xl font-semibold text-dama-charcoal">Checkout</h1>

        {/* Steps indicator */}
        <div className="mt-6 flex gap-4">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'info' ? 'text-dama-green-600' : 'text-dama-charcoal/50'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step === 'info' ? 'bg-dama-green-500 text-white' : 'bg-dama-green-100 text-dama-green-700'}`}>1</span>
            Your Info
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'payment' ? 'text-dama-green-600' : 'text-dama-charcoal/50'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step === 'payment' ? 'bg-dama-green-500 text-white' : 'bg-dama-sand text-dama-charcoal/50'}`}>2</span>
            Payment
          </div>
        </div>

        {priceWarning && (
          <div className="mt-4 rounded-md bg-dama-warning/10 border border-dama-warning/30 p-3 text-sm text-dama-charcoal/80">
            {priceWarning}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Main form area */}
          <div className="flex-1">
            {step === 'info' && (
              <div className="space-y-4 rounded-lg bg-white p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-dama-charcoal">Contact Information</h2>
                <Input
                  id="name"
                  label="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={errors.name}
                  placeholder="Jane Kim"
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  error={errors.email}
                  placeholder="jane@example.com"
                />
                <Input
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  error={errors.phone}
                  placeholder="(201) 555-0000"
                />
                <div className="w-full">
                  <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-dama-charcoal">
                    Order Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border border-dama-sand bg-white px-4 py-3 text-dama-charcoal placeholder:text-dama-sand focus:border-dama-green-400 focus:outline-none focus:ring-2 focus:ring-dama-green-400/20"
                    placeholder="Any special instructions..."
                  />
                </div>
                {(errors.date || errors.address) && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-dama-error">
                    {errors.date && <p>{errors.date}</p>}
                    {errors.address && <p>{errors.address}</p>}
                  </div>
                )}
                <Button fullWidth size="lg" onClick={handleContinueToPayment}>
                  Continue to Payment
                </Button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
                    {total === 0 ? 'Confirm Order' : 'Payment'}
                  </h2>
                  {paymentError && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-dama-error">
                      {paymentError}
                    </div>
                  )}
                  {isProcessing && (
                    <div className="mb-4 rounded-md bg-dama-green-50 p-3 text-sm text-dama-green-700">
                      Processing your order...
                    </div>
                  )}
                  {total === 0 ? (
                    <div>
                      <p className="mb-4 text-sm text-dama-charcoal/70">
                        Your promo code covers the full order. No payment needed!
                      </p>
                      <Button
                        fullWidth
                        size="lg"
                        onClick={handleFreeOrder}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div id="square-card-container" className="min-h-[90px]" />
                      {!cardReady && !paymentError && (
                        <div className="flex items-center justify-center py-4 text-sm text-dama-charcoal/50">
                          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Loading payment form...
                        </div>
                      )}
                      {cardReady && (
                        <Button
                          fullWidth
                          size="lg"
                          className="mt-4"
                          onClick={handlePayment}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                        </Button>
                      )}
                    </>
                  )}
                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-dama-charcoal/60">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M12 7H4a1 1 0 00-1 1v5a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Payments secured by Square
                  </p>
                </div>
                <button
                  onClick={() => setStep('info')}
                  className="text-sm text-dama-green-600 hover:underline"
                  disabled={isProcessing}
                >
                  &larr; Back to your info
                </button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="w-full lg:w-72">
            <div className="rounded-lg bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
                Order Summary
              </h3>
              <div className="space-y-2">
                {items.map((item) =>
                  item.type === 'tray' ? (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-dama-charcoal/70">
                        Custom Tray ({item.traySize}-slot)
                      </span>
                      <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ) : (
                    <div key={item.menuItem.id} className="flex justify-between text-sm">
                      <span className="text-dama-charcoal/70">
                        {item.menuItem.nameEn} x{item.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(item.menuItem.price * item.quantity)}</span>
                    </div>
                  )
                )}
              </div>
              {/* Promo code */}
              <div className="mt-3 border-t border-dama-sand pt-3">
                {promoCode ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dama-green-600">
                      Code: <span className="font-medium">{promoCode}</span>
                    </span>
                    <button onClick={clearPromo} className="text-xs text-dama-charcoal/60 hover:text-dama-error">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      aria-label="Promo code"
                      className="w-full rounded-md border border-dama-sand px-3 py-1.5 text-xs focus:border-dama-green-400 focus:outline-none focus:ring-1 focus:ring-dama-green-400/20"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      className="shrink-0 rounded-md bg-dama-green-50 px-3 py-1.5 text-xs font-medium text-dama-green-700 hover:bg-dama-green-100 disabled:opacity-50"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {promoError && <p className="mt-1 text-xs text-dama-error">{promoError}</p>}
              </div>
              <hr className="my-3 border-dama-sand" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dama-charcoal/60">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dama-charcoal/60">{deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                  <span className="font-medium">
                    {deliveryMethod === 'pickup' ? 'Free' : deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-dama-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <hr className="border-dama-sand" />
                <div className="flex justify-between">
                  <span className="font-semibold text-dama-charcoal">Total</span>
                  <span className="text-lg font-bold text-dama-charcoal">{formatPrice(total)}</span>
                </div>
              </div>
              {deliveryDate && (
                <div className="mt-3 space-y-1 text-xs text-dama-charcoal/50">
                  <p>
                    {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}: {new Date(deliveryDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  {deliveryMethod === 'building-delivery' && deliveryAddress && (
                    <p>To: {deliveryAddress}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
