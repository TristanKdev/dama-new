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
          name: 'Sweet Chicken Dosirak',
          description: 'Tender chicken stir-fried with rice cakes, cabbage, and sweet potato in a bold gochujang sauce. Chuncheon-style dakgalbi — spicy, satisfying, and deeply Korean.',
          offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'USD' },
        },
        {
          '@type': 'MenuItem',
          name: 'Spicy Pork Dosirak',
          description: 'Spicy pork stir-fry with multigrain rice, pan-fried jeon and mandu, kabocha, kimchi, fernbrake, radish',
          offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'USD' },
        },
        {
          '@type': 'MenuItem',
          name: 'Beef Bulgogi Dosirak',
          description: 'Korean beef bulgogi with vegetable fried rice, japchae, kabocha salad, lotus root, kimchi, radish',
          offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'USD' },
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
