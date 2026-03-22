'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@/types/menu';
import type { DeliveryMethod } from '@/types/order';
import type { TraySize } from '@/types/tray';
import { DELIVERY } from '@/lib/constants';

export interface RegularCartItem {
  type: 'regular';
  menuItem: MenuItem;
  quantity: number;
}

export interface TrayCartItem {
  type: 'tray';
  id: string;
  traySize: TraySize;
  items: { menuItem: MenuItem; quantity: number }[];
  totalPrice: number;
}

export type CartItem = RegularCartItem | TrayCartItem;

interface CartState {
  items: CartItem[];
  deliveryDate: string | null;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  isOpen: boolean;
  promoCode: string | null;
  promoDiscount: number;
  promoDiscountType: 'percent' | 'fixed' | null;
  promoDiscountValue: number;

  addItem: (menuItem: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  addTray: (tray: TrayCartItem) => void;
  removeTray: (trayId: string) => void;
  clearCart: () => void;
  setDeliveryDate: (date: string) => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setDeliveryAddress: (address: string) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  updateItemPrices: (priceMap: Map<string, number>) => void;

  applyPromo: (code: string, discount: number, discountType: 'percent' | 'fixed', discountValue: number) => void;
  clearPromo: () => void;

  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryDate: null,
      deliveryMethod: 'building-delivery',
      deliveryAddress: '',
      isOpen: false,
      promoCode: null,
      promoDiscount: 0,
      promoDiscountType: null,
      promoDiscountValue: 0,

      addItem: (menuItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.type === 'regular' && i.menuItem.id === menuItem.id
          ) as RegularCartItem | undefined;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.type === 'regular' && i.menuItem.id === menuItem.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, 10) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { type: 'regular' as const, menuItem, quantity: 1 }] };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.type === 'regular' && i.menuItem.id === itemId)
          ),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.type === 'regular' && i.menuItem.id === itemId
              ? { ...i, quantity: Math.min(quantity, 10) }
              : i
          ),
        }));
      },

      addTray: (tray) => {
        set((state) => ({ items: [...state.items, tray] }));
      },

      removeTray: (trayId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.type === 'tray' && i.id === trayId)
          ),
        }));
      },

      updateItemPrices: (priceMap) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.type === 'regular') {
              const newPrice = priceMap.get(item.menuItem.id);
              if (newPrice !== undefined && newPrice !== item.menuItem.price) {
                return { ...item, menuItem: { ...item.menuItem, price: newPrice } };
              }
            }
            return item;
          }),
          // Clear promo since discount was computed against old prices
          ...(state.promoCode ? { promoCode: null, promoDiscount: 0, promoDiscountType: null, promoDiscountValue: 0 } : {}),
        }));
      },

      clearCart: () => set({ items: [], deliveryDate: null, deliveryAddress: '', promoCode: null, promoDiscount: 0, promoDiscountType: null, promoDiscountValue: 0 }),

      setDeliveryDate: (date) => set({ deliveryDate: date }),
      setDeliveryMethod: (method) => set({ deliveryMethod: method }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyPromo: (code, discount, discountType, discountValue) => set({
        promoCode: code,
        promoDiscount: discount,
        promoDiscountType: discountType,
        promoDiscountValue: discountValue,
      }),
      clearPromo: () => set({
        promoCode: null,
        promoDiscount: 0,
        promoDiscountType: null,
        promoDiscountValue: 0,
      }),

      getItemCount: () => {
        return get().items.reduce((sum, i) => {
          if (i.type === 'tray') return sum + 1;
          return sum + i.quantity;
        }, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, i) => {
          if (i.type === 'tray') return sum + i.totalPrice;
          return sum + i.menuItem.price * i.quantity;
        }, 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (get().deliveryMethod === 'pickup') return 0;
        return subtotal >= DELIVERY.freeDeliveryMinimum ? 0 : DELIVERY.deliveryFee;
      },
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const fee = get().getDeliveryFee();
        const discount = get().promoDiscount;
        return Math.max(0, subtotal + fee - discount);
      },
    }),
    {
      name: 'dama-cart',
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        deliveryDate: state.deliveryDate,
        deliveryMethod: state.deliveryMethod,
        deliveryAddress: state.deliveryAddress,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
        promoDiscountType: state.promoDiscountType,
        promoDiscountValue: state.promoDiscountValue,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state && Array.isArray(state.items)) {
            state.items = state.items
              .map((item: CartItem) => {
                // Migration: add type: 'regular' to any legacy items missing the field
                if (!item.type) {
                  return { ...(item as RegularCartItem), type: 'regular' as const };
                }
                return item;
              })
              .filter((item: CartItem) => {
                // Drop corrupted items missing required fields
                if (item.type === 'tray') return item.id && Array.isArray(item.items) && typeof item.totalPrice === 'number';
                return item.menuItem?.id && typeof item.menuItem?.price === 'number' && typeof item.quantity === 'number';
              });
          }
        };
      },
    }
  )
);
