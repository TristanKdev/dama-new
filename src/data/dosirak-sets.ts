import type { MenuItem } from '@/types/menu';

// ── Dosirak Sets — per Final Menu document (source of truth) ──

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
    id: 'dosirak-chicken',
    nameKo: '담아 치킨 세트',
    nameEn: 'DAMA Chicken Set',
    subtitle: 'Korean sweet & tangy chicken (8 pcs)',
    description:
      'Crispy Korean-style sweet and tangy chicken pieces served with japchae, kabocha salad, braised burdock root, fresh cucumber kimchi, and seasonal namul.',
    price: 24,
    imageUrl: '/images/food/dosirak-classic-box.jpg',
    badges: ['Best Seller', 'High Protein'],
    setContents: [
      'Steamed white rice',
      'Korean Sweet & Tangy Chicken (8 pcs)',
      'Japchae (glass noodles)',
      'Donggeurangttaeng & Vegetable Jeon',
      'Kabocha salad',
      'Braised burdock root',
      'Seasoned zucchini & radish namul',
      'Fresh cucumber kimchi',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-pork',
    nameKo: '담아 제육 세트',
    nameEn: 'DAMA Spicy Pork Set',
    subtitle: 'Bold gochujang pork with multigrain rice',
    description:
      'Tender pork stir-fried in a fiery gochujang marinade, paired with Korean multigrain rice, kimchi & vegetable jeon, fried dumplings, and a full spread of banchan.',
    price: 24,
    imageUrl: '/images/food/dosirak-premium-box.jpg',
    badges: ['Spicy', 'Best Seller', 'High Protein'],
    setContents: [
      'Multigrain rice (잡곡밥)',
      'Spicy pork stir-fry (Jeyuk Bokkeum)',
      'Kabocha salad',
      'Fernbrake namul (Gosari)',
      'Seasoned radish namul',
      'Kimchi & vegetable jeon',
      'Fried dumplings (Mandu)',
      'Donggeurangttaeng',
      'Braised burdock root',
      'Seasoned zucchini',
      'Napa cabbage kimchi',
    ],
    dietaryTags: ['Spicy'],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-bulgogi',
    nameKo: '담아 불고기 세트',
    nameEn: 'DAMA Beef Set',
    subtitle: 'Classic marinated beef bulgogi',
    description:
      'Thinly sliced beef bulgogi marinated in soy, sesame, and Asian pear — the most universally loved Korean main. Served with japchae, kabocha salad, braised burdock root, and seasonal banchan.',
    price: 24,
    imageUrl: '/images/food/dosirak-bulgogi-box.jpg',
    badges: ['Best Seller', 'Kids Favorite', 'Mild', 'High Protein'],
    setContents: [
      'Steamed white rice',
      'Korean beef bulgogi',
      'Japchae (glass noodles)',
      'Fernbrake namul (Gosari)',
      'Seasoned radish namul',
      'Kabocha salad',
      'Braised burdock root',
      'Seasoned zucchini',
      'Fresh cucumber kimchi',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-yubu-chobap-kimbap',
    nameKo: '유부초밥 김밥',
    nameEn: 'Yubu Chobap & Kimbap',
    subtitle: 'Korean stuffed tofu pockets, kimbap & rolled omelet',
    description:
      'A light dosirak featuring yubu chobap (Korean-style seasoned rice in fried tofu pockets), kimbap rolls, and rolled omelet — perfect for picnics, outings, or a quick Korean lunch.',
    price: 12,
    imageUrl: '/images/food/dosirak-picnic-mini.jpg',
    badges: ['Kids Favorite', 'Mild'],
    setContents: [
      'Yubu chobap (stuffed tofu pockets)',
      'Kimbap',
      'Rolled omelet (Gyeran Mari)',
      'Seasonal fruits',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-spring-roll-kimbap',
    nameKo: '스프링롤 김밥',
    nameEn: 'Spring Roll & Kimbap',
    subtitle: 'Kimbap, fresh spring rolls & yubu chobap',
    description:
      'A curated variety box with kimbap, fresh spring rolls, and yubu chobap — paired with seasonal fruits and salad for a light Korean meal.',
    price: 12,
    imageUrl: '/images/food/dosirak-mini-variety.jpg',
    badges: ['Best Seller', 'Mild'],
    setContents: [
      'Kimbap',
      'Fresh spring rolls',
      'Yubu chobap (stuffed tofu pockets)',
      'Seasonal fruits',
      'Salad',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
  {
    id: 'dosirak-japchae',
    nameKo: '잡채',
    nameEn: 'Japchae',
    subtitle: 'Glass noodle stir-fry with vegetables',
    description:
      'A plant-forward box built around japchae — sweet potato glass noodles with seasonal vegetables, egg garnish, kabocha salad, and optional kimchi.',
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
  {
    id: 'dosirak-k-yubu-chobap',
    nameKo: '케이-유부초밥',
    nameEn: 'K-Yubu Chobap',
    subtitle: 'Three-flavor Korean stuffed tofu pockets',
    description:
      'A premium yubu chobap platter featuring spicy pork, three-color namul, and beef bulgogi fillings — served with rolled omelet and fresh seasonal fruits. Korean-style seasoned rice in fried tofu pockets.',
    price: 12,
    imageUrl: '/images/food/dosirak-k-yubu-chobap.jpg',
    badges: ['Best Seller', 'High Protein'],
    setContents: [
      'Spicy pork yubu chobap',
      'Three-color namul yubu chobap',
      'Beef bulgogi yubu chobap',
      'Rolled omelet (Gyeran Mari)',
      'Fresh seasonal fruits',
    ],
    dietaryTags: [],
    available: true,
    soldOut: false,
  },
];
