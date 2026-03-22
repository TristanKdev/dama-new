'use client';

import { useEffect, useRef } from 'react';
import { useCartStore, type RegularCartItem, type TrayCartItem } from '@/lib/cart-store';
import { QuantitySelector } from './QuantitySelector';
import { Button } from './Button';
import { formatPrice, cn } from '@/lib/utils';
import Link from 'next/link';

function RegularItemRow({ item }: { item: RegularCartItem }) {
  const { removeItem, updateQuantity } = useCartStore();
  return (
    <li className="flex gap-4 border-b border-dama-sand/50 pb-4 last:border-0">
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-dama-charcoal">{item.menuItem.nameEn}</p>
            <p className="text-xs text-dama-charcoal/50">{item.menuItem.nameKo}</p>
          </div>
          <button
            onClick={() => removeItem(item.menuItem.id)}
            className="ml-2 text-dama-charcoal/60 transition-colors hover:text-dama-error"
            aria-label={`Remove ${item.menuItem.nameEn}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4L4 12" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(q) => updateQuantity(item.menuItem.id, q)}
          />
          <span className="text-sm font-medium text-dama-charcoal">
            {formatPrice(item.menuItem.price * item.quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}

function TrayItemRow({ item }: { item: TrayCartItem }) {
  const { removeTray } = useCartStore();
  return (
    <li className="border-b border-dama-sand/50 pb-4 last:border-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dama-charcoal">
            Custom Tray ({item.traySize}-slot)
          </p>
          <ul className="mt-1 space-y-0.5">
            {item.items.map((ti) => (
              <li key={ti.menuItem.id} className="text-xs text-dama-charcoal/50">
                {ti.menuItem.nameEn} x{ti.quantity}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => removeTray(item.id)}
          className="ml-2 text-dama-charcoal/60 transition-colors hover:text-dama-error"
          aria-label="Remove tray"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4L4 12" />
          </svg>
        </button>
      </div>
      <div className="mt-2 text-right">
        <span className="text-sm font-medium text-dama-charcoal">
          {formatPrice(item.totalPrice)}
        </span>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const { items, isOpen, closeCart, getSubtotal, getDeliveryFee, getTotal, getItemCount } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-[transform,visibility] duration-300 ease-in-out',
          isOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dama-sand px-6 py-4">
          <h2 className="font-cormorant text-xl font-semibold text-dama-charcoal">
            Your Cart ({getItemCount()})
          </h2>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-dama-sand/50"
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-2 text-lg font-medium text-dama-charcoal/50">Your cart is empty</p>
              <p className="mb-6 text-sm text-dama-charcoal/60">Add some delicious banchan to get started</p>
              <Button variant="secondary" size="sm" onClick={closeCart}>
                Browse Menu
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) =>
                item.type === 'tray' ? (
                  <TrayItemRow key={item.id} item={item} />
                ) : (
                  <RegularItemRow key={item.menuItem.id} item={item} />
                )
              )}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-dama-sand px-6 py-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-dama-charcoal/60">Subtotal</span>
              <span className="font-medium">{formatPrice(getSubtotal())}</span>
            </div>
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-dama-charcoal/60">Delivery</span>
              <span className="font-medium">
                {getDeliveryFee() === 0 ? 'Free' : formatPrice(getDeliveryFee())}
              </span>
            </div>
            <div className="mb-4 flex justify-between border-t border-dama-sand pt-3">
              <span className="font-medium text-dama-charcoal">Total</span>
              <span className="text-lg font-semibold text-dama-charcoal">{formatPrice(getTotal())}</span>
            </div>
            <Link href="/cart" onClick={closeCart}>
              <Button fullWidth size="lg">
                View Cart & Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
