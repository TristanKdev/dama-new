export type DietaryTag = 'Vegan' | 'Vegetarian' | 'Gluten-Friendly' | 'Spicy' | 'Contains Nuts' | 'Dairy-Free';

export type ItemCategory = 'banchan' | 'dosirak' | 'appetizer' | 'seasonal' | 'main';

export type BanchanSubcategory = 'muchim' | 'bokkeum' | 'jorim' | 'kimchi';

export interface MenuItem {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  price: number;
  category: ItemCategory;
  dietaryTags: DietaryTag[];
  imageUrl?: string;
  available: boolean;
  soldOut: boolean;
  servingSize: string;
  ingredients?: string[];
  spiceLevel?: 0 | 1 | 2 | 3;
  subcategory?: BanchanSubcategory;
  badges?: string[];
  upgradePrice?: number;
  setContents?: string[];
  note?: string;
  review?: string;
}

export interface DeliveryDate {
  date: string; // ISO date string YYYY-MM-DD
  dayOfWeek: 'Tuesday' | 'Thursday' | 'Saturday';
  available: boolean;
  cutoffTime: string; // ISO datetime for order cutoff
  menuItems: string[]; // MenuItem IDs available on this date
}
