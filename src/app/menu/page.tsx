import type { Metadata } from 'next';
import { getSquareCatalogItems } from '@/lib/square-catalog';
import { menuItems as staticMenuItems } from '@/data/menu-items';
import { dosirakSets } from '@/data/dosirak-sets';
import MenuClient from './menu-client';

export const metadata: Metadata = {
  title: 'Menu — Dosirak Sets & Banchan Sides',
  description:
    'Choose your dosirak meal box and add banchan sides. 3 signature Korean meal boxes starting at $16 and 30 authentic banchan. Delivered fresh Tue/Thu/Sat in Jersey City, NJ.',
  openGraph: {
    title: 'DAM:A Menu — Korean Dosirak Sets & Banchan',
    description:
      'Explore our curated Korean menu: Classic, Premium Galbi, and Garden (Vegan) dosirak boxes plus 30 authentic banchan sides. Order online for delivery in Jersey City.',
    images: [{ url: '/images/food/dosirak-box-layout.jpg', width: 1200, height: 1200, alt: 'DAM:A Dosirak Box with 8 compartments of Korean banchan and rice' }],
  },
  alternates: {
    canonical: '/menu',
  },
};

export const revalidate = 300;

// Static JSON-LD for menu structured data — safe to inline (no user input)
const menuJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: 'DAM:A Menu',
  description: 'Korean dosirak meal boxes and banchan side dishes. Delivered Tue/Thu/Sat in Jersey City, NJ.',
  hasMenuSection: [
    {
      '@type': 'MenuSection',
      name: 'Dosirak Meal Boxes',
      description: 'Complete Korean meal boxes with rice, protein, and curated banchan',
      hasMenuItem: [
        {
          '@type': 'MenuItem',
          name: 'Classic Dosirak',
          description: 'Rice, protein of the week, 5 chef-selected banchan, kimchi, sesame dipping sauce',
          offers: { '@type': 'Offer', price: '18.00', priceCurrency: 'USD' },
        },
        {
          '@type': 'MenuItem',
          name: 'Premium Galbi Dosirak',
          description: 'Rice, Beef Short Rib Galbi (Tteokgalbi), 6 chef-selected banchan, kimchi, assorted dipping sauces',
          offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'USD' },
        },
        {
          '@type': 'MenuItem',
          name: 'Garden Dosirak (Vegan)',
          description: 'Rice, japchae, pan-fried tofu, 4 seasonal vegetable banchan, white kimchi',
          offers: { '@type': 'Offer', price: '16.00', priceCurrency: 'USD' },
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
      ],
    },
    {
      '@type': 'MenuSection',
      name: 'Banchan Side Dishes',
      description: '30 authentic Korean side dishes — mix and match to customize your order',
    },
  ],
});

export default async function MenuPage() {
  let menuItems;
  try {
    menuItems = await getSquareCatalogItems();
    if (menuItems.length === 0) menuItems = staticMenuItems;
  } catch {
    menuItems = staticMenuItems;
  }

  return (
    <>
      {/* JSON-LD: Static hardcoded menu data, safe to inline */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: menuJsonLd }} />
      <MenuClient menuItems={menuItems} dosirakSets={dosirakSets} />
    </>
  );
}
