import type { MenuItem } from '@/types/menu';

// ── The 3 Dosirak Sets — Hero Menu Items ──
// These are the main products. Each is a complete Korean meal box.

export interface DosirakSet {
  id: string;
  nameKo: string;
  nameEn: string;
  subtitle: string;
  description: string;
  price: number;
  imageUrl: string;
  badges: string[];
  setContents: string[];
  dietaryTags: MenuItem['dietaryTags'];
  available: boolean;
  soldOut: boolean;
  upgradePrice?: number;
}

export const dosirakSets: DosirakSet[] = [
  {
    id: 'dosirak-classic',
    nameKo: '클래식 도시락',
    nameEn: 'Classic Dosirak',
    subtitle: 'Our signature Korean meal box',
    description:
      'The essential DAM:A experience. A balanced dosirak built on the chilcheopbansang tradition — rice, a protein centerpiece, and five curated banchan. Everything you need for a complete Korean meal.',
    price: 18,
    imageUrl: '/images/food/dosirak-lunch.jpg',
    badges: ['Best Seller', 'Signature'],
    setContents: [
      'Steamed white rice',
      'Protein of the week (rotating)',
      '5 chef-selected banchan',
      'House-made kimchi',
      'Sesame dipping sauce',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
    upgradePrice: 6,
  },
  {
    id: 'dosirak-premium',
    nameKo: '프리미엄 도시락',
    nameEn: 'Premium Galbi Dosirak',
    subtitle: 'Elevated with signature short rib',
    description:
      'Our premium meal box featuring Beef Short Rib Galbi (Tteokgalbi) — the Party DAM:A signature dish. Paired with six banchan, rice, and house kimchi. The Korean table, perfected.',
    price: 24,
    imageUrl: '/images/food/dosirak-dinner-1.jpg',
    badges: ['Premium', 'Signature'],
    setContents: [
      'Steamed white rice',
      'Beef Short Rib Galbi (Tteokgalbi)',
      '6 chef-selected banchan',
      'House-made kimchi',
      'Assorted dipping sauces',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-veggie',
    nameKo: '채식 도시락',
    nameEn: 'Garden Dosirak',
    subtitle: 'Plant-based Korean wellness',
    description:
      'A fully plant-based dosirak celebrating the vegetable-forward side of Korean cuisine. Japchae, pan-fried tofu, seasonal namul, and white kimchi — wholesome, colorful, and satisfying.',
    price: 16,
    imageUrl: '/images/food/dosirak-vegan-lunch.jpg',
    badges: ['Vegan', 'Plant-Based'],
    setContents: [
      'Steamed white rice',
      'Japchae (glass noodle stir-fry)',
      'Pan-fried tofu with dipping sauce',
      '4 seasonal vegetable banchan',
      'White kimchi (non-spicy)',
    ],
    dietaryTags: ['Vegan'],
    available: true,
    soldOut: false,
  },
];
