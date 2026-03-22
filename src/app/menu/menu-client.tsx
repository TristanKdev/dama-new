'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { DateSelector } from '@/components/menu/DateSelector';
import { DeliverySidebar } from '@/components/menu/DeliverySidebar';
import { Accordion } from '@/components/ui/Accordion';
import { DELIVERY } from '@/lib/constants';
import type { MenuItem, ItemCategory, DietaryTag, BanchanSubcategory } from '@/types/menu';

const banchanSubcategoryMeta: { value: BanchanSubcategory | 'all'; label: string; labelKo: string }[] = [
  { value: 'all', label: 'All Banchan', labelKo: '전체' },
  { value: 'muchim', label: 'Muchim', labelKo: '무침류' },
  { value: 'bokkeum', label: 'Bokkeum', labelKo: '볶음류' },
  { value: 'jorim', label: 'Jorim', labelKo: '조림류' },
  { value: 'kimchi', label: 'Kimchi', labelKo: '김치류' },
];

const subcategoryDescriptions: Record<string, string> = {
  muchim: 'Seasoned & dressed — classic Korean banchan flavors',
  bokkeum: 'Stir-fried — savory sides that pair perfectly with rice',
  jorim: 'Braised & soy-glazed — deep, comforting Korean flavors',
  kimchi: 'Fermented favorites — from mild to bold',
};

interface MenuClientProps {
  menuItems: MenuItem[];
}

export default function MenuClient({ menuItems }: MenuClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeBanchanSub, setActiveBanchanSub] = useState<BanchanSubcategory | 'all'>('all');
  const [selectedDiet, setSelectedDiet] = useState<DietaryTag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | ItemCategory>('all');

  const dietaryTags: DietaryTag[] = ['Gluten-Friendly', 'Dairy-Free', 'Vegan', 'Vegetarian'];

  const banchanItems = useMemo(() =>
    menuItems.filter(item => {
      if (item.category !== 'banchan') return false;
      if (activeBanchanSub !== 'all' && item.subcategory !== activeBanchanSub) return false;
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
    }), [menuItems, activeBanchanSub, selectedDiet, searchQuery]);

  const mainDishes = useMemo(() =>
    menuItems.filter(item => {
      if (item.category !== 'main') return false;
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

  // Derive section images from Square catalog items
  const firstBanchanImage = menuItems.find(i => i.category === 'banchan' && i.imageUrl)?.imageUrl;
  const firstMainImage = menuItems.find(i => i.category === 'main' && i.imageUrl)?.imageUrl;
  const firstAnyImage = menuItems.find(i => i.imageUrl)?.imageUrl;

  const sectionNav: { value: 'all' | ItemCategory; label: string; labelKo: string; image?: string }[] = [
    { value: 'all', label: 'Full Menu', labelKo: '전체 메뉴', image: firstAnyImage },
    { value: 'banchan', label: 'Banchan', labelKo: '반찬', image: firstBanchanImage },
    { value: 'main' as ItemCategory, label: 'Main Dishes', labelKo: '메인', image: firstMainImage },
  ];

  const deliveryInfoItems = [
    { id: 'days', title: 'Delivery Days', content: `We deliver on ${DELIVERY.days.join(', ')} between ${DELIVERY.hours}.` },
    { id: 'cutoff', title: 'Order Cutoff', content: DELIVERY.cutoffNote },
    { id: 'fee', title: 'Delivery Fee', content: `Free on orders over $${DELIVERY.freeDeliveryMinimum}. Otherwise $${DELIVERY.deliveryFee}.` },
  ];

  const showBanchan = activeSection === 'all' || activeSection === 'banchan';
  const showMainDishes = activeSection === 'all' || activeSection === ('main' as ItemCategory);

  return (
    <div className="bg-dama-cream">
      {/* Header */}
      <div className="border-b border-dama-sand bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Our Menu</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            Handcrafted Korean Comfort
          </h1>
          <p className="mt-2 max-w-2xl text-base text-dama-charcoal/60">
            Curated dosirak sets, 30 authentic banchan to build your own box, and Korean street-style appetizers. Order by 10 PM for next-day delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            {/* Date selector - mobile */}
            <div className="mb-6 lg:hidden">
              <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
            </div>

            {/* Section navigation — image tiles */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {sectionNav.map(sec => (
                <button
                  key={sec.value}
                  onClick={() => setActiveSection(sec.value)}
                  aria-pressed={activeSection === sec.value}
                  className={`group relative overflow-hidden rounded-xl transition-all ${
                    activeSection === sec.value
                      ? 'ring-2 ring-dama-green-500 ring-offset-2'
                      : 'ring-1 ring-dama-sand/50 hover:ring-dama-green-300'
                  }`}
                >
                  <div className="relative aspect-[3/2] w-full">
                    {sec.image ? (
                      <Image
                        src={sec.image}
                        alt={sec.label}
                        fill
                        className={`object-cover transition-all duration-300 ${
                          activeSection === sec.value
                            ? 'brightness-75'
                            : 'brightness-[0.6] group-hover:brightness-75 group-hover:scale-105'
                        }`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className={`absolute inset-0 transition-all duration-300 ${
                        activeSection === sec.value ? 'bg-dama-green-700' : 'bg-dama-green-800 group-hover:bg-dama-green-700'
                      }`} />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="text-sm font-bold tracking-wide drop-shadow-lg sm:text-base">{sec.label}</span>
                      <span className="mt-0.5 font-noto-kr text-xs opacity-80 drop-shadow-lg">{sec.labelKo}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Search + Dietary filters */}
            {(showBanchan || showMainDishes) && (
              <>
                <div className="relative mb-4">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dama-charcoal/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, Korean name, or description..."
                    aria-label="Search menu items"
                    className="w-full rounded-lg border border-dama-sand bg-white py-2.5 pl-10 pr-4 text-sm text-dama-charcoal placeholder:text-dama-charcoal/60 focus:border-dama-green-500 focus:outline-none focus:ring-1 focus:ring-dama-green-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dama-charcoal/60 hover:text-dama-charcoal/70"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-dama-charcoal/50">Dietary:</span>
                  {dietaryTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedDiet(selectedDiet === tag ? null : tag)}
                      aria-pressed={selectedDiet === tag}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        selectedDiet === tag
                          ? 'bg-dama-green-100 text-dama-green-700 ring-1 ring-dama-green-300'
                          : 'bg-white text-dama-charcoal/60 hover:bg-dama-green-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedDiet && (
                    <button
                      onClick={() => setSelectedDiet(null)}
                      className="text-xs text-dama-charcoal/60 hover:text-dama-charcoal/70"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ═══ BANCHAN SECTION ═══ */}
            {showBanchan && (
              <section className="mb-12">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal">
                      Banchan — Side Dishes
                    </h2>
                    <p className="mt-1 text-sm text-dama-charcoal/50">
                      The curated side dishes at the heart of the Korean table. Choose 4, 8, or 12 to build your BYOB tray.
                    </p>
                  </div>
                  <Link
                    href="/build-your-own"
                    className="rounded-lg bg-dama-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-dama-green-700"
                  >
                    Build Your Tray &rarr;
                  </Link>
                </div>

                {banchanItems.length === 0 ? (
                  <div className="rounded-lg bg-white p-8 text-center">
                    <p className="text-base text-dama-charcoal/60">
                      {searchQuery ? `No banchan matching "${searchQuery}"` : 'No items match your filters.'}
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveBanchanSub('all'); setSelectedDiet(null); }}
                      className="mt-3 text-sm font-medium text-dama-green-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <MenuGrid items={banchanItems} />
                )}
              </section>
            )}

            {/* ═══ MAIN DISHES SECTION ═══ */}
            {showMainDishes && (
              <section className="mb-12">
                <div className="mb-6">
                  <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal">
                    Main Dishes — Proteins &amp; Centerpiece Dishes
                  </h2>
                  <p className="mt-1 text-sm text-dama-charcoal/50">
                    Every DAM:A dosirak box is anchored by a main dish. Designed to pair with the banchan selection.
                  </p>
                </div>

                {mainDishes.length === 0 ? (
                  <div className="rounded-lg bg-white p-8 text-center">
                    <p className="text-base text-dama-charcoal/60">
                      {searchQuery ? `No main dishes matching "${searchQuery}"` : 'No items match your filters.'}
                    </p>
                  </div>
                ) : (
                  <MenuGrid items={mainDishes} />
                )}
              </section>
            )}

            {/* Allergen notice */}
            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Allergen Information</h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Our kitchen uses soy, sesame, wheat, eggs, shellfish, fish, tree nuts, and peanuts. Cross-contact is possible.
                If you have a food allergy or dietary restriction, please contact us at{' '}
                <a href="mailto:hello@damajc.com" className="underline">hello@damajc.com</a>{' '}
                or call (201) 630-0530 before ordering so we can accommodate your needs.
              </p>
            </div>

            {/* Mobile delivery info */}
            <div className="mt-8 lg:hidden">
              <Accordion items={deliveryInfoItems} />
            </div>
          </div>

          {/* Sidebar - desktop */}
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
              <DeliverySidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
