'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DateSelector } from '@/components/menu/DateSelector';
import { DeliverySidebar } from '@/components/menu/DeliverySidebar';
import { Accordion } from '@/components/ui/Accordion';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { DELIVERY } from '@/lib/constants';
import type { MenuItem, DietaryTag } from '@/types/menu';
import type { DosirakSet } from '@/data/dosirak-sets';

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

interface MenuClientProps {
  menuItems: MenuItem[];
  dosirakSets: DosirakSet[];
}

export default function MenuClient({ menuItems, dosirakSets }: MenuClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<DietaryTag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSides, setExpandedSides] = useState(false);

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

  const visibleBanchan = expandedSides ? banchanItems : banchanItems.slice(0, 8);

  function handleAddDosirak(set: DosirakSet) {
    const asMenuItem: MenuItem = {
      id: set.id,
      nameKo: set.nameKo,
      nameEn: set.nameEn,
      description: set.description,
      price: set.price,
      category: 'dosirak',
      dietaryTags: set.dietaryTags,
      imageUrl: set.imageUrl,
      available: set.available,
      soldOut: set.soldOut,
      servingSize: '1 box',
      badges: set.badges,
      setContents: set.setContents,
      upgradePrice: set.upgradePrice,
    };
    addItem(asMenuItem);
    openCart();
  }

  function handleAddSide(item: MenuItem) {
    addItem(item);
    openCart();
  }

  const deliveryInfoItems = [
    { id: 'days', title: 'Delivery Days', content: `We deliver on ${DELIVERY.days.join(', ')} by ${DELIVERY.hours}.` },
    { id: 'cutoff', title: 'Order Cutoff', content: DELIVERY.cutoffNote },
    { id: 'fee', title: 'Delivery Fee', content: `Free on orders over $${DELIVERY.freeDeliveryMinimum}. Otherwise $${DELIVERY.deliveryFee}.` },
  ];

  return (
    <div className="bg-dama-cream">
      {/* Hero Header */}
      <div className="border-b border-dama-sand bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Our Menu</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            Choose Your Dosirak
          </h1>
          <p className="mt-2 max-w-2xl text-base text-dama-charcoal/60">
            Pick your meal box, then add banchan sides to complete your Korean table. Order by 10 PM for next-day delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ═══ MAIN CONTENT ═══ */}
          <div className="flex-1">
            {/* Date selector - mobile */}
            <div className="mb-6 lg:hidden">
              <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
            </div>

            {/* ═══ DOSIRAK SETS — HERO SECTION ═══ */}
            <section className="mb-12">
              <div className="mb-6">
                <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
                  Dosirak Sets
                </h2>
                <p className="mt-0.5 text-xs font-medium text-dama-green-600">
                  Dosirak (도시락) — A Korean lunch box with rice, protein, and curated banchan sides in one balanced meal.
                </p>
                <p className="mt-1 text-sm text-dama-charcoal/50">
                  Complete Korean meal boxes — ready to enjoy.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {dosirakSets.map((set) => (
                  <article
                    key={set.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-dama-sand/50 bg-white shadow-sm transition-all hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-dama-ivory">
                      <Image
                        src={set.imageUrl}
                        alt={set.nameEn}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority
                      />
                      {set.soldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-dama-charcoal/60">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-dama-charcoal">Sold Out</span>
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                        {set.badges.map(badge => (
                          <span key={badge} className="rounded-full bg-dama-green-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-3">
                      <p className="font-noto-kr text-[10px] text-dama-charcoal/40">{set.nameKo}</p>
                      <h3 className="text-sm font-bold text-dama-charcoal">{set.nameEn}</h3>
                      <p className="mt-0.5 text-[10px] font-medium text-dama-green-600">{set.subtitle}</p>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-dama-charcoal/60">
                        {set.description}
                      </p>

                      {/* What's Inside */}
                      <div className="mt-2 flex-1 rounded-md bg-dama-cream/60 p-2">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-dama-charcoal/50">What&apos;s Inside</p>
                        <ul className="space-y-0">
                          {set.setContents.map((content, i) => (
                            <li key={i} className="flex items-start gap-1 text-[11px] text-dama-charcoal/70">
                              <span className="mt-0.5 text-dama-green-500">&#8226;</span>
                              {content}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price + CTA */}
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-dama-sand/30">
                        <div>
                          <span className="text-lg font-bold text-dama-green-600">{formatPrice(set.price)}</span>
                          {set.upgradePrice && (
                            <p className="text-[10px] font-medium text-amber-600">Galbi upgrade +${set.upgradePrice}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAddDosirak(set)}
                          disabled={set.soldOut || !set.available}
                          size="sm"
                        >
                          {set.soldOut ? 'Sold Out' : 'Add to Cart'}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* ═══ BANCHAN ADD-ONS ═══ */}
            <section className="mb-12">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal">
                    Add Banchan Sides
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-dama-green-600">
                    Banchan (반찬) — Korean side dishes served alongside rice. Small portions, big flavor — the heart of a Korean table.
                  </p>
                  <p className="mt-1 text-sm text-dama-charcoal/50">
                    Customize your order with extra banchan. 30 authentic Korean side dishes.
                  </p>
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
              <div className="mb-4 flex flex-wrap items-center gap-2">
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

              {/* Banchan Grid — compact cards */}
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
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {visibleBanchan.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-dama-sand/40 bg-white transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start gap-3 p-3">
                          {/* Thumbnail */}
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
                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-dama-charcoal">{item.nameEn}</p>
                                <p className="font-noto-kr text-[10px] text-dama-charcoal/40">{item.nameKo}</p>
                                {(item.glossary || getTermExplanation(item.nameEn)) && (
                                  <p className="text-[10px] italic leading-snug text-dama-green-600/70">{item.glossary || getTermExplanation(item.nameEn)}</p>
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
                                onClick={() => handleAddSide(item)}
                                disabled={item.soldOut || !item.available}
                                className="ml-auto shrink-0 rounded-full bg-dama-green-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-dama-green-600 disabled:opacity-40"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* Detail fields */}
                        {(item.flavorProfile || item.texture || item.pairsWellWith || item.chefsNote) && (
                          <div className="border-t border-dama-sand/30 px-3 py-2 space-y-1.5">
                            {item.flavorProfile && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-dama-green-600">Flavor</p>
                                <p className="text-[11px] leading-snug text-dama-charcoal/60">{item.flavorProfile}</p>
                              </div>
                            )}
                            {item.texture && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-dama-green-600">Texture</p>
                                <p className="text-[11px] leading-snug text-dama-charcoal/60">{item.texture}</p>
                              </div>
                            )}
                            {item.pairsWellWith && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-dama-green-600">Pairs With</p>
                                <p className="text-[11px] leading-snug text-dama-charcoal/60">{item.pairsWellWith}</p>
                              </div>
                            )}
                            {item.chefsNote && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-dama-green-600">Chef&apos;s Note</p>
                                <p className="text-[11px] leading-snug text-dama-charcoal/60">{item.chefsNote}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Review */}
                        {item.review && (
                          <div className="border-t border-dama-sand/30 bg-dama-cream/40 px-3 py-2">
                            <p className="text-[11px] italic leading-snug text-dama-charcoal/50">
                              &ldquo;{item.review}&rdquo;
                            </p>
                          </div>
                        )}
                        {/* Freshness note */}
                        {item.note && (
                          <div className="border-t border-amber-200/50 bg-amber-50/50 px-3 py-1.5">
                            <p className="text-[10px] font-medium text-amber-700">{item.note}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {banchanItems.length > 8 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setExpandedSides(!expandedSides)}
                        className="text-sm font-medium text-dama-green-600 hover:underline"
                      >
                        {expandedSides
                          ? 'Show fewer sides'
                          : `View all ${banchanItems.length} banchan sides`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Allergen notice */}
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Allergen Information</h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Our kitchen uses soy, sesame, wheat, eggs, shellfish, fish, tree nuts, and peanuts. Cross-contact is possible.
                If you have a food allergy or dietary restriction, please contact us at{' '}
                <a href="mailto:hello@damajc.com" className="underline">hello@damajc.com</a>{' '}
                or call (201) 923-0773 before ordering.
              </p>
            </div>

            {/* Mobile delivery info */}
            <div className="mt-6 lg:hidden">
              <Accordion items={deliveryInfoItems} />
            </div>
          </div>

          {/* ═══ SIDEBAR — desktop ═══ */}
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
