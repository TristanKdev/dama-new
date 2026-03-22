'use client';

import Link from 'next/link';
import { useCartStore, type RegularCartItem, type TrayCartItem } from '@/lib/cart-store';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { formatPrice } from '@/lib/utils';
import { DELIVERY } from '@/lib/constants';

function RegularCartRow({ item }: { item: RegularCartItem }) {
  const { removeItem, updateQuantity } = useCartStore();
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-dama-charcoal">{item.menuItem.nameEn}</h3>
        <p className="text-xs text-dama-charcoal/50">{item.menuItem.nameKo} · {item.menuItem.servingSize}</p>
      </div>
      <QuantitySelector
        quantity={item.quantity}
        onQuantityChange={(q) => updateQuantity(item.menuItem.id, q)}
      />
      <span className="w-16 text-right text-sm font-medium">
        {formatPrice(item.menuItem.price * item.quantity)}
      </span>
      <button
        onClick={() => removeItem(item.menuItem.id)}
        className="text-dama-charcoal/50 hover:text-dama-error"
        aria-label={`Remove ${item.menuItem.nameEn}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l8 8M12 4L4 12" />
        </svg>
      </button>
    </div>
  );
}

function TrayCartRow({ item }: { item: TrayCartItem }) {
  const { removeTray } = useCartStore();
  return (
    <div className="flex items-start gap-4 p-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-dama-green-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dama-green-600">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18M15 3v18M3 15h18" />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-dama-charcoal">Custom Tray ({item.traySize}-slot)</h3>
        <p className="text-xs text-dama-charcoal/50">
          {item.items.map((ti) => `${ti.menuItem.nameEn} x${ti.quantity}`).join(', ')}
        </p>
      </div>
      <span className="w-16 text-right text-sm font-medium">
        {formatPrice(item.totalPrice)}
      </span>
      <button
        onClick={() => removeTray(item.id)}
        className="text-dama-charcoal/50 hover:text-dama-error"
        aria-label="Remove tray"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l8 8M12 4L4 12" />
        </svg>
      </button>
    </div>
  );
}

export default function CartPage() {
  const {
    items, clearCart,
    deliveryDate, setDeliveryDate,
    deliveryMethod, setDeliveryMethod,
    deliveryAddress, setDeliveryAddress,
    getSubtotal, getDeliveryFee, getTotal,
  } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="bg-dama-cream py-24">
        <div className="mx-auto max-w-lg px-4 text-center md:px-6">
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Your Cart is Empty</h1>
          <p className="mt-3 text-base text-dama-charcoal/60">Add some delicious banchan to get started.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/menu">
              <Button size="lg">Browse Menu</Button>
            </Link>
            <Link href="/build-your-own">
              <Button size="lg" variant="secondary">Build Your Own Tray</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-dama-charcoal/50">
            Or <Link href="/subscribe" className="text-dama-green-600 hover:underline">subscribe &amp; save 10%</Link> on weekly deliveries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dama-cream">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Your Cart</h1>
          <button onClick={clearCart} className="text-sm text-dama-charcoal/50 hover:text-dama-error">
            Clear Cart
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Items */}
          <div className="flex-1">
            <div className="divide-y divide-dama-sand rounded-lg bg-white">
              {items.map((item) =>
                item.type === 'tray' ? (
                  <TrayCartRow key={item.id} item={item} />
                ) : (
                  <RegularCartRow key={item.menuItem.id} item={item} />
                )
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="space-y-6">
              {/* Delivery date */}
              <div className="rounded-lg bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
                  Delivery Date
                </h3>
                <Calendar selectedDate={deliveryDate} onDateSelect={setDeliveryDate} />
              </div>

              {/* Delivery method */}
              <div className="rounded-lg bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
                  Delivery Method
                </h3>
                <div className="space-y-2">
                  {(['building-delivery', 'pickup'] as const).map((method) => (
                    <label key={method} className="flex cursor-pointer items-center gap-3 rounded-md border border-dama-sand p-3 transition-colors hover:bg-dama-green-50">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={method}
                        checked={deliveryMethod === method}
                        onChange={() => setDeliveryMethod(method)}
                        className="accent-dama-green-500"
                      />
                      <span className="text-sm text-dama-charcoal">
                        {method === 'building-delivery' ? 'Building Delivery' : 'Pickup'}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Delivery address — shown for building delivery */}
                {deliveryMethod === 'building-delivery' && (
                  <div className="mt-3">
                    <label htmlFor="delivery-address" className="mb-1 block text-xs font-medium text-dama-charcoal/60">
                      Building / Address
                    </label>
                    <input
                      id="delivery-address"
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. The Beacon, 55 Hudson St"
                      className="w-full rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal placeholder:text-dama-charcoal/60 focus:border-dama-green-400 focus:outline-none focus:ring-1 focus:ring-dama-green-400/20"
                    />
                    <p className="mt-1 text-xs text-dama-charcoal/60">
                      Enter your building name or full address in Jersey City
                    </p>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dama-charcoal/60">Subtotal</span>
                    <span className="font-medium">{formatPrice(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dama-charcoal/60">Delivery</span>
                    <span className="font-medium">{getDeliveryFee() === 0 ? 'Free' : formatPrice(getDeliveryFee())}</span>
                  </div>
                  {getSubtotal() > 0 && getSubtotal() < 30 && deliveryMethod === 'building-delivery' && (
                    <p className="text-xs text-dama-green-600">Add {formatPrice(30 - getSubtotal())} more for free delivery</p>
                  )}
                  <hr className="border-dama-sand" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-dama-charcoal">Total</span>
                    <span className="text-lg font-bold text-dama-charcoal">{formatPrice(getTotal())}</span>
                  </div>
                </div>
                {(() => {
                  const sub = getSubtotal();
                  const belowMinimum = sub < DELIVERY.minimumOrder;
                  const needsAddress = deliveryMethod === 'building-delivery' && !deliveryAddress.trim();
                  const canCheckout = !!deliveryDate && !belowMinimum && !needsAddress;
                  return (
                    <>
                      <Link href={canCheckout ? '/checkout' : '#'} onClick={(e) => !canCheckout && e.preventDefault()}>
                        <Button
                          fullWidth
                          size="lg"
                          className="mt-4"
                          disabled={!canCheckout}
                        >
                          Checkout
                        </Button>
                      </Link>
                      {!deliveryDate && (
                        <p className="mt-2 text-center text-xs text-dama-error">Please select a delivery date</p>
                      )}
                      {belowMinimum && (
                        <p className="mt-2 text-center text-xs text-dama-error">
                          Minimum order is {formatPrice(DELIVERY.minimumOrder)} (add {formatPrice(DELIVERY.minimumOrder - sub)} more)
                        </p>
                      )}
                      {needsAddress && deliveryDate && (
                        <p className="mt-2 text-center text-xs text-dama-error">Please enter a delivery address</p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
