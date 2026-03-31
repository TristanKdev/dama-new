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
    images: [{ url: '/images/logo/logo-green.png', width: 1200, height: 560, alt: 'DAM:A — Korean Dosirak Sets & Banchan' }],
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
          name: 'DAMA Chicken Set',
          description: 'Korean sweet & tangy chicken with japchae, kabocha salad, braised burdock root, fresh cucumber kimchi, and seasonal namul.',
          offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'USD' },
        },
        {
          '@type': 'MenuItem',
          name: 'DAMA Spicy Pork Set',
          description: 'Spicy pork stir-fry with multigrain rice, kimchi & vegetable jeon, fried dumplings, kabocha salad, fernbrake, and braised burdock root.',
          offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'USD' },
        },
        {
          '@type': 'MenuItem',
          name: 'DAMA Beef Set',
          description: 'Korean beef bulgogi with japchae, kabocha salad, fernbrake, braised burdock root, and fresh cucumber kimchi.',
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
// Build: 1774917993
