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
    nameEn: 'Chicken Galbi Dosirak',
    subtitle: 'Chuncheon-style spicy chicken',
    description:
      'Tender chicken stir-fried with rice cakes, cabbage, and sweet potato in a bold gochujang sauce. Chuncheon-style dakgalbi — spicy, satisfying, and deeply Korean.',
    price: 18,
    imageUrl: '/images/food/dosirak-classic-box.jpg',
    badges: ['Spicy', 'Best Seller', 'High Protein'],
    setContents: [
      'Steamed white rice',
      'Chicken Galbi (닭갈비)',
      'Kabocha squash salad',
      'Burdock root stir-fry',
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
    price: 18,
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
    price: 20,
    imageUrl: '/images/food/dosirak-bulgogi-box.jpg',
    badges: ['Best Seller', 'Kids Favorite', 'Mild', 'High Protein'],
    setContents: [
      'Vegetable fried rice',
      'Korean beef bulgogi',
      'Japchae (glass noodles)',
      'Kabocha squash salad',
      'Burdock root stir-fry',
      'Kimchi',
      'Pickled radish',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
];
