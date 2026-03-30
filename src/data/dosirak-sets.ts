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
    id: 'dosirak-chicken-galbi',
    nameKo: '닭갈비 도시락',
    nameEn: 'Sweet Chicken Dosirak',
    subtitle: 'Chuncheon-style spicy chicken',
    description:
      'Tender chicken stir-fried with rice cakes, cabbage, and sweet potato in a bold gochujang sauce. Chuncheon-style dakgalbi — spicy, satisfying, and deeply Korean.',
    price: 24,
    imageUrl: '/images/food/dosirak-classic-box.jpg',
    badges: ['Spicy', 'Best Seller', 'High Protein'],
    setContents: [
      'Steamed white rice',
      'Chicken Galbi (닭갈비)',
      'Kabocha squash salad',
      'Lotus root stir-fry',
      'Kimchi',
      'Japchae (glass noodles)',
      'Mandu & egg roll',
    ],
    dietaryTags: ['Spicy'],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-pork',
    nameKo: '제육 도시락',
    nameEn: 'Spicy Pork Dosirak',
    subtitle: 'Bold gochujang pork with multigrain rice',
    description:
      'Tender pork stir-fried in a fiery gochujang marinade, paired with Korean multigrain rice, pan-fried jeon, crispy mandu, and a full spread of banchan. The signature Korean working lunch.',
    price: 24,
    imageUrl: '/images/food/dosirak-premium-box.jpg',
    badges: ['Spicy', 'Best Seller', 'High Protein'],
    setContents: [
      'Multigrain rice (잡곡밥)',
      'Spicy pork stir-fry (Jeyuk Bokkeum)',
      'Pan-fried jeon & mandu',
      'Kabocha squash salad',
      'Kimchi',
      'Fernbrake namul',
      'Pickled radish',
    ],
    dietaryTags: ['Spicy'],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-bulgogi',
    nameKo: '불고기 도시락',
    nameEn: 'Beef Bulgogi Dosirak',
    subtitle: 'Classic marinated beef with fried rice',
    description:
      'Thinly sliced beef bulgogi marinated in soy, sesame, and Asian pear — the most universally loved Korean main. Served with vegetable fried rice, japchae, kabocha, and an array of seasonal banchan.',
    price: 24,
    imageUrl: '/images/food/dosirak-bulgogi-box.jpg',
    badges: ['Best Seller', 'Kids Favorite', 'Mild', 'High Protein'],
    setContents: [
      'Vegetable fried rice',
      'Korean beef bulgogi',
      'Japchae (glass noodles)',
      'Kabocha squash salad',
      'Lotus root stir-fry',
      'Kimchi',
      'Pickled radish',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-picnic-mini',
    nameKo: '피크닉 미니 도시락',
    nameEn: 'Picnic Mini Dosirak',
    subtitle: 'Kimbap, rolled omelet & seasonal fruits',
    description:
      'A light, grab-and-go dosirak featuring kimbap, rolled omelet, and seasonal fruits — perfect for picnics, outings, or a quick Korean lunch.',
    price: 12,
    imageUrl: '/images/food/dosirak-picnic-mini.jpg',
    badges: ['Kids Favorite', 'Mild'],
    setContents: [
      'Kimbap',
      'Rolled omelet (Gyeran Mari)',
      'Japchae (glass noodles)',
      'Seasonal fruits',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-mini-variety',
    nameKo: '미니 도시락 모듬',
    nameEn: 'Mini Dosirak Variety',
    subtitle: 'Kimbap, Japchae, Fresh Spring Rolls & Seasonal Fruits',
    description:
      'A curated variety box with kimbap, japchae, fresh spring rolls, and seasonal fruits — paired with salad for a light Korean meal.',
    price: 12,
    imageUrl: '/images/food/dosirak-mini-variety.jpg',
    badges: ['Best Seller', 'Mild'],
    setContents: [
      'Kimbap',
      'Japchae (glass noodles)',
      'Fresh spring rolls',
      'Rolled omelet (Gyeran Mari)',
      'Seasonal fruits',
      'Salad',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-japchae',
    nameKo: '잡채 도시락',
    nameEn: 'Japchae Dosirak',
    subtitle: 'Glass noodle stir-fry with vegetables',
    description:
      'A plant-forward dosirak built around japchae — sweet potato glass noodles with seasonal vegetables, egg garnish, kabocha salad, and optional kimchi.',
    price: 12,
    imageUrl: '/images/food/dosirak-japchae.jpg',
    badges: ['Vegan', 'Best Seller'],
    setContents: [
      'Japchae (glass noodles)',
      'Egg garnish',
      'Vegetables (carrot, spinach, shiitake, onion)',
      'Kabocha salad',
      'Kimchi (optional)',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
];
