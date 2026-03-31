'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';
import type { MenuItem, DietaryTag } from '@/types/menu';

// Korean food term explanations (per Sylvia's glossary)
const KOREAN_TERMS: Record<string, string> = {
  'Namul': 'Seasoned Korean vegetable side dish, dressed with sesame oil, garlic, and soy sauce.',
  'Kimbap': 'Korean rice rolls — seasoned rice and fillings wrapped in roasted seaweed, sliced into rounds.',
  'Japchae': 'Korean glass noodles — sweet potato starch noodles stir-fried with vegetables and sesame soy sauce.',
  'Tteok': 'Korean rice cake — soft, chewy cake made from pounded glutinous rice.',
  'Jeon': 'Korean savory pancake — crispy, pan-fried with green onion, kimchi, or seafood.',
  'Mandu': 'Korean dumplings — pan-fried or steamed, filled with seasoned meat and vegetables.',
  'Tteokgalbi': 'Korean grilled short rib patties — minced beef short rib, savory and juicy.',
  'Dakgalbi': 'Spicy Korean stir-fried chicken — gochujang marinade with rice cakes, cabbage, and sweet potato.',
  'Jeyuk Bokkeum': 'Spicy Korean pork stir-fry — thinly sliced pork in a bold gochujang marinade.',
  'Yubu Chobap': 'Seasoned rice stuffed inside sweet fried tofu pockets — soft, slightly sweet.',
  'Dotori Muk': 'Traditional Korean cold side — firm, silky acorn starch jelly with soy-sesame dressing.',
  'Kabocha': 'A sweet, dense pumpkin variety widely used in Korean cooking — naturally creamy.',
  'Kkakdugi': 'Cubed radish kimchi — bite-sized Korean radish fermented with gochugaru and aromatics.',
  'Baek Kimchi': 'White kimchi — non-spicy, fermented without chili. Mild and refreshing.',
  'Burdock': 'Braised burdock root — slow-cooked in a sweet soy glaze until caramelized and tender.',
  'Wakame': 'Seasoned Korean seaweed salad — tossed with sesame oil and light vinegar dressing.',
};

function getTermExplanation(name: string): string | null {
  for (const [term, explanation] of Object.entries(KOREAN_TERMS)) {
    if (name.toLowerCase().includes(term.toLowerCase())) return explanation;
  }
  return null;
}

interface GrabAndGoClientProps {
  menuItems: MenuItem[];
}

export default function GrabAndGoClient({ menuItems }: GrabAndGoClientProps) {
  const [selectedDiet, setSelectedDiet] = useState<DietaryTag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const dietaryTags: DietaryTag[] = ['Gluten-Friendly', 'Dairy-Free', 'Vegan', 'Vegetarian'];

  const banchanItems = useMemo(() =>
    menuItems.filter(item => {
      if (item.category !== 'banchan') return false;
      if (selectedDiet && !item.dietaryTags.includes(selectedDiet)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.nameEn.toLowerCase().includes(q) &&
          !item.nameKo.toLowerCase().includes(q) &&
          !item.description.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    }), [menuItems, selectedDiet, searchQuery]);

  function handleAdd(item: MenuItem) {
    addItem(item);
    openCart();
  }

  return (
    <div className="bg-dama-cream">
      {/* Hero */}
      <div className="border-b border-dama-sand bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Pickup Only</p>
          <h1 className="mt-1 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            Build Your Banchan
          </h1>
          <p className="mt-0.5 font-noto-kr text-sm text-dama-charcoal/40">포장 반찬</p>
          <p className="mt-3 max-w-2xl text-base text-dama-charcoal/60">
            Fresh Korean banchan available for same-day pickup at our Jersey City kitchen. Choose your sides, place your order by 10 PM the night before, and pick up at 16 Bright Street Unit H.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Pickup info */}
        <div className="mb-8 rounded-lg border border-dama-green-200 bg-dama-green-50/50 p-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-dama-green-700">Pickup Location</p>
              <p className="mt-1 text-sm text-dama-charcoal">{BUSINESS.pickupLocation.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-dama-green-700">Available</p>
              <p className="mt-1 text-sm text-dama-charcoal">Tuesday, Thursday, Saturday</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-dama-green-700">Order Cutoff</p>
              <p className="mt-1 text-sm text-dama-charcoal">10 PM the night before</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-dama-green-700">Minimum</p>
              <p className="mt-1 text-sm text-dama-charcoal">No minimum for pickup</p>
            </div>
          </div>
        </div>

        {/* Search + Dietary filters */}
        <div className="relative mb-3">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dama-charcoal/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search banchan..."
            aria-label="Search banchan"
            className="w-full rounded-lg border border-dama-sand bg-white py-2 pl-10 pr-4 text-sm text-dama-charcoal placeholder:text-dama-charcoal/40 focus:border-dama-green-500 focus:outline-none focus:ring-1 focus:ring-dama-green-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dama-charcoal/40 hover:text-dama-charcoal/60"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-dama-charcoal/40">Filter:</span>
          {dietaryTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedDiet(selectedDiet === tag ? null : tag)}
              aria-pressed={selectedDiet === tag}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedDiet === tag
                  ? 'bg-dama-green-100 text-dama-green-700 ring-1 ring-dama-green-300'
                  : 'bg-white text-dama-charcoal/50 hover:bg-dama-green-50'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedDiet && (
            <button onClick={() => setSelectedDiet(null)} className="text-xs text-dama-charcoal/40 hover:text-dama-charcoal/60">
              Clear
            </button>
          )}
        </div>

        {/* Banchan Grid */}
        {banchanItems.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center">
            <p className="text-base text-dama-charcoal/60">
              {searchQuery ? `No banchan matching "${searchQuery}"` : 'No items match your filters.'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDiet(null); }}
              className="mt-3 text-sm font-medium text-dama-green-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {banchanItems.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-dama-sand/40 bg-white transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3 p-3">
                  {item.imageUrl && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl}
                        alt={item.nameEn}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-dama-charcoal">{item.nameEn}</p>
                        <p className="font-noto-kr text-[10px] text-dama-charcoal/40">{item.nameKo}</p>
                        {getTermExplanation(item.nameEn) && (
                          <p className="text-[10px] italic leading-snug text-dama-green-600/70">{getTermExplanation(item.nameEn)}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-bold text-dama-green-600">{formatPrice(item.price)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-snug text-dama-charcoal/50 line-clamp-2">{item.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {item.badges && item.badges.map(b => (
                        <span key={b} className="rounded-full bg-dama-green-50 px-1.5 py-0.5 text-[10px] font-medium text-dama-green-700">{b}</span>
                      ))}
                      <button
                        onClick={() => handleAdd(item)}
                        disabled={item.soldOut || !item.available}
                        className="ml-auto shrink-0 rounded-full bg-dama-green-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-dama-green-600 disabled:opacity-40"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
                {item.review && (
                  <div className="border-t border-dama-sand/30 bg-dama-cream/40 px-3 py-2">
                    <p className="text-[11px] italic leading-snug text-dama-charcoal/50">
                      &ldquo;{item.review}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-dama-charcoal/40">
          {banchanItems.length} banchan items available for pickup
        </p>
      </div>
    </div>
  );
}
