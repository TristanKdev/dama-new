'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TrayGrid } from './TrayGrid';
import { TrayItemPicker } from './TrayItemPicker';
import { Button } from '@/components/ui/Button';
import { useCartStore, type TrayCartItem } from '@/lib/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import type { MenuItem } from '@/types/menu';
import type { TraySlot, TraySize } from '@/types/tray';
import { TRAY_CONFIGS } from '@/types/tray';

function createEmptySlots(size: TraySize): TraySlot[] {
  return Array.from({ length: size }, (_, i) => ({
    index: i,
    menuItem: null,
    isDouble: false,
    isDoubleSecond: false,
  }));
}

function generateId() {
  return `tray-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TrayBuilder() {
  const router = useRouter();
  const { addTray, openCart } = useCartStore();
  const [step, setStep] = useState<'size' | 'build'>('size');
  const [traySize, setTraySize] = useState<TraySize>(4);
  const [slots, setSlots] = useState<TraySlot[]>(createEmptySlots(4));
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDouble, setIsDouble] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const config = TRAY_CONFIGS.find((c) => c.size === traySize)!;

  useEffect(() => {
    async function fetchItems() {
      try {
        const { getSquareCatalogItems } = await import('@/lib/square-catalog');
        const items = await getSquareCatalogItems('banchan');
        if (items.length > 0) {
          setMenuItems(items.filter(i => i.available && !i.soldOut));
        } else {
          const { allBanchanItems } = await import('@/data/menu-items');
          setMenuItems(allBanchanItems.filter(i => i.available && !i.soldOut));
        }
      } catch {
        try {
          const { allBanchanItems } = await import('@/data/menu-items');
          setMenuItems(allBanchanItems.filter(i => i.available && !i.soldOut));
        } catch {
          // ignore
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, []);

  const filledCount = useMemo(
    () => slots.filter((s) => s.menuItem !== null || s.isDoubleSecond).length,
    [slots]
  );

  const isTrayFull = filledCount === traySize;

  const totalPrice = useMemo(
    () =>
      slots.reduce((sum, s) => {
        if (s.menuItem && !s.isDoubleSecond) {
          return sum + s.menuItem.price * (s.isDouble ? 2 : 1);
        }
        return sum;
      }, 0),
    [slots]
  );

  const handleSelectSize = (size: TraySize) => {
    setTraySize(size);
    setSlots(createEmptySlots(size));
    setStep('build');
    setSelectedItem(null);
    setIsDouble(false);
  };

  const handleSlotClick = useCallback(
    (index: number) => {
      const slot = slots[index];

      // If slot is filled, remove the item
      if (slot.menuItem) {
        setSlots((prev) => {
          const next = [...prev];
          if (slot.isDouble && slot.pairIndex !== undefined) {
            // Remove both slots
            next[index] = { ...next[index], menuItem: null, isDouble: false, pairIndex: undefined };
            next[slot.pairIndex] = {
              ...next[slot.pairIndex],
              menuItem: null,
              isDoubleSecond: false,
              pairIndex: undefined,
            };
          } else {
            next[index] = { ...next[index], menuItem: null, isDouble: false };
          }
          return next;
        });
        return;
      }

      // If an item is selected, place it
      if (!selectedItem) return;

      if (isDouble) {
        const columns = config.columns;
        if (index % columns >= columns - 1) return; // can't place double at end of row
        if (index + 1 >= slots.length) return;
        if (slots[index + 1].menuItem || slots[index + 1].isDoubleSecond) return;

        setSlots((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], menuItem: selectedItem, isDouble: true, pairIndex: index + 1 };
          next[index + 1] = { ...next[index + 1], menuItem: null, isDoubleSecond: true, pairIndex: index };
          return next;
        });
      } else {
        setSlots((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], menuItem: selectedItem, isDouble: false };
          return next;
        });
      }

      setSelectedItem(null);
      setIsDouble(false);
    },
    [slots, selectedItem, isDouble, config.columns]
  );

  const handleAddToCart = () => {
    // Aggregate items by menuItem id
    const itemMap = new Map<string, { menuItem: MenuItem; quantity: number }>();
    for (const slot of slots) {
      if (slot.menuItem && !slot.isDoubleSecond) {
        const key = slot.menuItem.id;
        const qty = slot.isDouble ? 2 : 1;
        if (itemMap.has(key)) {
          itemMap.get(key)!.quantity += qty;
        } else {
          itemMap.set(key, { menuItem: slot.menuItem, quantity: qty });
        }
      }
    }

    const trayCartItem: TrayCartItem = {
      type: 'tray',
      id: generateId(),
      traySize,
      items: Array.from(itemMap.values()),
      totalPrice,
    };

    addTray(trayCartItem);
    openCart();
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-dama-charcoal/60">Loading menu items...</p>
      </div>
    );
  }

  // Step 1: Size selection
  if (step === 'size') {
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-center text-lg font-semibold text-dama-charcoal">
          Choose Your Tray Size
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TRAY_CONFIGS.map((cfg) => (
            <button
              key={cfg.size}
              type="button"
              onClick={() => handleSelectSize(cfg.size)}
              className="group rounded-lg border-2 border-dama-sand bg-white p-6 text-center transition-all hover:border-dama-green-400 hover:shadow-md"
            >
              <div className="mb-2 text-3xl font-bold text-dama-green-600 group-hover:text-dama-green-700">
                {cfg.size}
              </div>
              <p className="text-sm font-medium text-dama-charcoal">{cfg.label}</p>
              <p className="mt-1 text-xs text-dama-charcoal/50">
                {cfg.columns} x {cfg.rows} grid · {cfg.price}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Build the tray
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setStep('size')}
          className="text-sm text-dama-green-600 hover:underline"
        >
          &larr; Change tray size
        </button>
        <div className="text-right">
          <p className="text-sm text-dama-charcoal/60">
            {filledCount}/{traySize} slots filled
          </p>
          <p className="text-lg font-bold text-dama-charcoal">
            {formatPrice(totalPrice)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Grid */}
        <div className="flex-1">
          <TrayGrid
            slots={slots}
            traySize={traySize}
            columns={config.columns}
            selectedItem={selectedItem}
            isDouble={isDouble}
            onSlotClick={handleSlotClick}
          />

          {/* Add to Cart button */}
          <div className="mt-6">
            <Button
              fullWidth
              size="lg"
              disabled={!isTrayFull}
              onClick={handleAddToCart}
              className={cn(!isTrayFull && 'opacity-50 cursor-not-allowed')}
            >
              {isTrayFull
                ? `Add Tray to Cart — ${formatPrice(totalPrice)}`
                : `Fill all ${traySize} slots to continue`}
            </Button>
          </div>
        </div>

        {/* Item picker sidebar */}
        <div className="w-full lg:w-80">
          <TrayItemPicker
            menuItems={menuItems}
            selectedItem={selectedItem}
            isDouble={isDouble}
            onSelectItem={(item) => {
              setSelectedItem(item);
              setIsDouble(false);
            }}
            onToggleDouble={() => setIsDouble(!isDouble)}
          />
        </div>
      </div>
    </div>
  );
}
