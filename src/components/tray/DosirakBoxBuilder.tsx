'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useCartStore, type TrayCartItem } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/types/menu';

/*
 * Dosirak box compartment layout (matches the real box photo):
 *
 *  ┌──────────┬────────────────┐
 *  │ PROTEIN  │     RICE       │
 *  │  (main)  │  (large area)  │
 *  ├──────────┼───────┬────────┤
 *  │  SIDE 1  │ SIDE 2│ SIDE 3 │
 *  │ (medium) │(small)│(small) │
 *  ├──────────┼───────┼────────┤
 *  │  SIDE 4  │ SIDE 5│ SIDE 6 │
 *  │ (small)  │(small)│(medium)│
 *  └──────────┴───────┴────────┘
 */

interface Compartment {
  id: string;
  label: string;
  type: 'protein' | 'rice' | 'side';
  gridArea: string;
  menuItem: MenuItem | null;
}

const INITIAL_COMPARTMENTS: Compartment[] = [
  { id: 'protein', label: 'Protein', type: 'protein', gridArea: '1 / 1 / 2 / 2', menuItem: null },
  { id: 'rice', label: 'Rice', type: 'rice', gridArea: '1 / 2 / 2 / 4', menuItem: null },
  { id: 'side-1', label: 'Side 1', type: 'side', gridArea: '2 / 1 / 3 / 2', menuItem: null },
  { id: 'side-2', label: 'Side 2', type: 'side', gridArea: '2 / 2 / 3 / 3', menuItem: null },
  { id: 'side-3', label: 'Side 3', type: 'side', gridArea: '2 / 3 / 3 / 4', menuItem: null },
  { id: 'side-4', label: 'Side 4', type: 'side', gridArea: '3 / 1 / 4 / 2', menuItem: null },
  { id: 'side-5', label: 'Side 5', type: 'side', gridArea: '3 / 2 / 4 / 3', menuItem: null },
  { id: 'side-6', label: 'Side 6', type: 'side', gridArea: '3 / 3 / 4 / 4', menuItem: null },
];

interface DosirakBoxBuilderProps {
  banchanItems: MenuItem[];
  mainItems: MenuItem[];
}

export function DosirakBoxBuilder({ banchanItems, mainItems }: DosirakBoxBuilderProps) {
  const router = useRouter();
  const { addTray, openCart } = useCartStore();
  const [compartments, setCompartments] = useState<Compartment[]>(INITIAL_COMPARTMENTS);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filledCount = compartments.filter(c => c.menuItem !== null).length;
  const isFull = filledCount === compartments.length;

  const totalPrice = useMemo(() =>
    compartments.reduce((sum, c) => sum + (c.menuItem?.price || 0), 0),
    [compartments]
  );

  // Items to show in picker based on which slot is active
  const pickerItems = useMemo(() => {
    if (!activeSlot) return [];
    const slot = compartments.find(c => c.id === activeSlot);
    if (!slot) return [];

    const items = slot.type === 'protein' ? mainItems : banchanItems;
    if (!searchQuery.trim()) return items;

    const q = searchQuery.toLowerCase();
    return items.filter(i =>
      i.nameEn.toLowerCase().includes(q) ||
      i.nameKo.toLowerCase().includes(q)
    );
  }, [activeSlot, compartments, mainItems, banchanItems, searchQuery]);

  function handleSlotClick(slotId: string) {
    const compartment = compartments.find(c => c.id === slotId);
    if (!compartment) return;

    // If already filled, remove it
    if (compartment.menuItem) {
      setCompartments(prev => prev.map(c =>
        c.id === slotId ? { ...c, menuItem: null } : c
      ));
      return;
    }

    // Open picker for this slot
    setActiveSlot(slotId);
    setSearchQuery('');
  }

  function handlePickItem(item: MenuItem) {
    if (!activeSlot) return;
    setCompartments(prev => prev.map(c =>
      c.id === activeSlot ? { ...c, menuItem: item } : c
    ));
    setActiveSlot(null);
    setSearchQuery('');
  }

  function handleAddToCart() {
    const itemMap = new Map<string, { menuItem: MenuItem; quantity: number }>();
    for (const c of compartments) {
      if (c.menuItem) {
        const key = c.menuItem.id;
        if (itemMap.has(key)) {
          itemMap.get(key)!.quantity += 1;
        } else {
          itemMap.set(key, { menuItem: c.menuItem, quantity: 1 });
        }
      }
    }

    const trayCartItem: TrayCartItem = {
      type: 'tray',
      id: `dosirak-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      traySize: 8,
      items: Array.from(itemMap.values()),
      totalPrice,
    };

    addTray(trayCartItem);
    openCart();
    router.push('/cart');
  }

  function handleClear() {
    setCompartments(INITIAL_COMPARTMENTS);
    setActiveSlot(null);
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* ═══ DOSIRAK BOX VISUAL ═══ */}
      <div className="flex-1">
        {/* Reference image */}
        <div className="mb-4 overflow-hidden rounded-xl">
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <Image
              src="/images/food/dosirak-box-layout.jpg"
              alt="Dosirak box compartment layout reference"
              fill
              className="object-cover rounded-xl"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          </div>
        </div>

        <p className="mb-3 text-center text-sm text-dama-charcoal/50">
          Tap a compartment below to fill it. Tap a filled compartment to remove it.
        </p>

        {/* Interactive box */}
        <div className="mx-auto max-w-md rounded-2xl border-4 border-amber-700/30 bg-amber-50/50 p-3">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, minmax(80px, 1fr))' }}
          >
            {compartments.map((c) => {
              const isActive = activeSlot === c.id;
              const isFilled = c.menuItem !== null;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSlotClick(c.id)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-dama-green-500 bg-dama-green-50 ring-2 ring-dama-green-300'
                      : isFilled
                        ? 'border-dama-green-400/50 bg-white'
                        : 'border-dashed border-dama-sand bg-white/80 hover:border-dama-green-300 hover:bg-dama-green-50/30'
                  }`}
                  style={{ gridArea: c.gridArea }}
                >
                  {isFilled ? (
                    <div className="flex h-full flex-col items-center justify-center p-1.5">
                      {c.menuItem!.imageUrl && (
                        <div className="relative h-10 w-10 overflow-hidden rounded-md">
                          <Image
                            src={c.menuItem!.imageUrl}
                            alt={c.menuItem!.nameEn}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <p className="mt-1 text-center text-[10px] font-medium leading-tight text-dama-charcoal line-clamp-2">
                        {c.menuItem!.nameEn}
                      </p>
                      <p className="text-[9px] text-dama-green-600">{formatPrice(c.menuItem!.price)}</p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dama-sand/30">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dama-charcoal/30">
                          <path d="M8 4v8M4 8h8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="mt-1 text-[10px] font-medium text-dama-charcoal/30">{c.label}</p>
                      <p className="text-[9px] text-dama-charcoal/20">
                        {c.type === 'protein' ? 'Main dish' : c.type === 'rice' ? 'Included' : 'Banchan'}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary bar */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-4">
          <div>
            <p className="text-sm text-dama-charcoal/60">{filledCount}/8 compartments filled</p>
            <p className="text-lg font-bold text-dama-charcoal">{formatPrice(totalPrice)}</p>
          </div>
          <div className="flex gap-2">
            {filledCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleClear}>Clear</Button>
            )}
            <Button size="sm" disabled={!isFull} onClick={handleAddToCart}>
              {isFull ? 'Add to Cart' : `Fill ${8 - filledCount} more`}
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ ITEM PICKER SIDEBAR ═══ */}
      <div className="w-full lg:w-80">
        <div className="sticky top-24 rounded-lg bg-white p-4">
          {activeSlot ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dama-charcoal">
                  {compartments.find(c => c.id === activeSlot)?.type === 'protein'
                    ? 'Choose a Protein'
                    : compartments.find(c => c.id === activeSlot)?.type === 'rice'
                      ? 'Rice is Included'
                      : `Pick ${compartments.find(c => c.id === activeSlot)?.label}`}
                </h3>
                <button
                  onClick={() => { setActiveSlot(null); setSearchQuery(''); }}
                  className="text-xs text-dama-charcoal/50 hover:text-dama-charcoal"
                >
                  Cancel
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-md border border-dama-sand bg-dama-cream/50 py-1.5 pl-3 pr-3 text-xs text-dama-charcoal placeholder:text-dama-charcoal/40 focus:border-dama-green-500 focus:outline-none"
                />
              </div>

              {/* Item list */}
              <div className="max-h-96 space-y-1.5 overflow-y-auto">
                {compartments.find(c => c.id === activeSlot)?.type === 'rice' ? (
                  <div className="rounded-md bg-dama-green-50 p-3 text-center">
                    <p className="text-sm font-medium text-dama-green-700">Steamed Rice</p>
                    <p className="mt-1 text-xs text-dama-green-600">Included with every dosirak</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const riceItem: MenuItem = {
                          id: 'steamed-rice',
                          nameKo: '밥',
                          nameEn: 'Steamed Rice',
                          description: 'Steamed white rice',
                          price: 0,
                          category: 'banchan',
                          dietaryTags: ['Vegan'],
                          available: true,
                          soldOut: false,
                          servingSize: '1 serving',
                        };
                        handlePickItem(riceItem);
                      }}
                    >
                      Add Rice
                    </Button>
                  </div>
                ) : (
                  pickerItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePickItem(item)}
                      className="w-full rounded-lg border border-dama-sand/30 p-2.5 text-left transition-colors hover:bg-dama-green-50"
                    >
                      <div className="flex items-start gap-2.5">
                        {item.imageUrl && (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                            <Image src={item.imageUrl} alt={item.nameEn} fill className="object-cover" sizes="48px" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-semibold text-dama-charcoal">{item.nameEn}</p>
                            <span className="shrink-0 text-xs font-bold text-dama-green-600">{formatPrice(item.price)}</span>
                          </div>
                          <p className="font-noto-kr text-[10px] text-dama-charcoal/40">{item.nameKo}</p>
                          {item.badges && item.badges.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-0.5">
                              {item.badges.map(b => (
                                <span key={b} className="rounded-full bg-dama-green-50 px-1 py-0.5 text-[8px] font-medium text-dama-green-700">{b}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.flavorProfile && (
                        <p className="mt-1.5 text-[10px] leading-snug text-dama-charcoal/50"><span className="font-semibold text-dama-green-600">Flavor:</span> {item.flavorProfile}</p>
                      )}
                      {item.chefsNote && (
                        <p className="mt-0.5 text-[10px] leading-snug text-dama-charcoal/50"><span className="font-semibold text-dama-green-600">Chef:</span> {item.chefsNote}</p>
                      )}
                      {item.review && (
                        <p className="mt-0.5 text-[10px] italic leading-snug text-dama-charcoal/40">&ldquo;{item.review}&rdquo;</p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-dama-green-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dama-green-600">
                  <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-dama-charcoal">Tap a compartment</p>
              <p className="mt-1 text-xs text-dama-charcoal/50">
                Click any empty slot in the dosirak box to start filling it with your choice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
