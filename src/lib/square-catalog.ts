import { getSquareClient } from './square';
import type { MenuItem, DietaryTag, ItemCategory, BanchanSubcategory } from '@/types/menu';

// ── Category ID → ItemCategory mapping ──

const CATEGORY_MAP: Record<string, ItemCategory> = {
  'RKO5W56RYD6C7XRA2XPPRLOC': 'main',
  'NOZ3HGWX6Z52YSYW3UDIHMBS': 'banchan',
};

// "This Weeks Highlights" category — Sylvia manages this from Square dashboard
const FEATURED_CATEGORY_ID = 'DYYOYOEWYP65C3UK6NXJXQJL';

// ── Enrichment data ──

interface EnrichmentEntry {
  dietaryTags: DietaryTag[];
  spiceLevel: 0 | 1 | 2 | 3;
  badges: string[];
  subcategory?: BanchanSubcategory;
  note?: string;
  review?: string;
}

const ENRICHMENT_DATA: Record<string, EnrichmentEntry> = {
  // Main Dishes
  'spicy-pork-stir-fry': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Spicy', 'Best Seller', 'High Protein'],
    review: 'The spice level is spot on. The vegetable ratio is balanced.',
  },
  'korean-beef-bulgogi': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Best Seller', 'Kids Favorite', 'High Protein', 'Mild'],
    review: 'Children\'s absolute favorite. Disappeared before anything else on the table.',
  },
  'gimbap-korean-rice-roll': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Best Seller', 'Kids Favorite'],
  },
  'braised-mackerel': {
    dietaryTags: ['Spicy'],
    spiceLevel: 1,
    badges: ['High Protein', 'Spicy'],
  },
  'pork-ribs-in-soy-glaze': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['High Protein', 'Best Seller'],
  },
  'chicken-galbi': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Spicy', 'High Protein', 'Best Seller'],
  },
  'beef-short-rib-galbi': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['High Protein', 'Signature', 'Best Seller'],
  },

  // Banchan
  'kabocha-squash-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Kids Favorite'],
    subcategory: 'muchim',
    review: 'The seasoning is just right. My picky eater, who rarely finishes anything, ate this with rice and nothing else.',
  },
  'seasoned-radish-namul': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
    review: 'Perfect for those who enjoy the radish with a bite to it. Those who prefer softer texture may find this one firm — but in a good way.',
  },
  'stuffed-cucumber-kimchi': {
    dietaryTags: ['Vegan', 'Spicy'],
    spiceLevel: 2,
    badges: ['Vegan', 'Fermented', 'Spicy'],
    subcategory: 'kimchi',
    note: 'Eat fresh for crunch OR wait 2–3 days for deeper fermented flavor.',
    review: 'Crunchy and so refreshing. If you like it fresh, eat it right away. If you like it more fermented, leave it 2–3 days.',
  },
  'king-oyster-mushroom-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Best Seller', 'Vegan', 'Mild'],
    subcategory: 'bokkeum',
    review: 'Absolute BEST item. The combination of king oyster mushroom with paprika, chili, and onion is genuinely special. This one disappeared first.',
  },
  'fernbrake-namul': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
    review: 'The kids loved it — addictive flavor. Great as a bibimbap component.',
  },
  'sesame-spinach': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Best Seller'],
    subcategory: 'muchim',
    review: 'The spinach namul, fernbrake, and zucchini together with rice make a perfect bibimbap. A trio that just works.',
  },
  'zucchini-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'bokkeum',
    review: 'The namul trio — radish, spinach, zucchini — mixed into bibimbap is a revelation.',
  },
  'fish-cake-stir-fry': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild'],
    subcategory: 'bokkeum',
    review: 'A comforting, familiar banchan. Great with rice — the sauce is the star.',
  },
  'seasoned-bean-sprouts': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
    review: 'Refreshing and light. A great palate cleanser between heavier bites.',
  },
  'soy-braised-eggs': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild', 'High Protein', 'Best Seller'],
    subcategory: 'jorim',
    review: 'The leftover soy braising sauce is incredible — mix it into rice, use it to dip the tofu. Do not waste a drop.',
  },
  'glass-noodle-stir-fry-japchae': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Best Seller', 'Vegan'],
    subcategory: 'bokkeum',
    note: 'Best enjoyed same day. Texture changes after 24 hours.',
    review: 'Eat this first — it goes off fastest. Best consumed same day.',
  },
  'pan-fried-tofu': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'bokkeum',
    review: 'Did not even need the dipping sauce. So rich and nutty on its own.',
  },
  'broccoli-tofu-stir-fry': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Gluten-Friendly'],
    subcategory: 'bokkeum',
    review: 'Vegetables are intentionally cut smaller — same size as the tofu inside the stir-fry.',
  },
  'burdock-root-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'jorim',
  },
  'lotus-root-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'jorim',
  },
  'seasoned-sea-vegetable-wakame': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Gluten-Friendly'],
    subcategory: 'muchim',
  },
  'mung-bean-sprout-namul': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
  },
  'seasoned-squid-ojingeo-muchim': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Anju', 'Spicy', 'Drink Pairing'],
    subcategory: 'muchim',
    review: 'Perfect beer pairing for Korean palates. May be a new experience for those unfamiliar with dried seafood banchan.',
  },
  'seasoned-fish-cake-odeng-muchim': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Anju', 'Spicy', 'Drink Pairing'],
    subcategory: 'muchim',
    review: 'Perfect beer pairing for Korean palates. May be a new experience for those unfamiliar with dried seafood banchan.',
  },
  'potato-egg-salad': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild', 'Kids Favorite'],
    subcategory: 'muchim',
  },
  'sweet-corn-vegetable-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Kids Favorite'],
    subcategory: 'muchim',
  },
  'pan-fried-dumplings-mandu': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['High Protein', 'Best Seller'],
    subcategory: 'bokkeum',
  },
  'korean-egg-roll-gyeran-mari': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild', 'Kids Favorite'],
    subcategory: 'bokkeum',
  },
  'napa-cabbage-kimchi': {
    dietaryTags: ['Vegan', 'Spicy'],
    spiceLevel: 2,
    badges: ['Vegan', 'Fermented', 'Spicy', 'Best Seller'],
    subcategory: 'kimchi',
  },
  'radish-kimchi-kkakdugi': {
    dietaryTags: ['Vegan', 'Spicy'],
    spiceLevel: 2,
    badges: ['Vegan', 'Fermented', 'Spicy'],
    subcategory: 'kimchi',
  },
  'white-kimchi-baek-kimchi': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Fermented', 'Mild', 'Gluten-Friendly'],
    subcategory: 'kimchi',
  },
  'steamed-rice-cake': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Seasonal'],
  },
  'assorted-flavored-rice-cakes': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Seasonal', 'Best Seller'],
  },
  'acorn-jelly-dotori-muk': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Gluten-Friendly'],
  },
  'yuzu-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Seasonal', 'Mild'],
    subcategory: 'muchim',
  },
  'tofu-vegetable-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'High Protein'],
    subcategory: 'muchim',
  },
  'korean-savory-pancake-jeon': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Best Seller', 'Anju', 'Drink Pairing'],
    subcategory: 'bokkeum',
  },
};

// ── Helpers ──

/**
 * Convert an English item name to a lowercase hyphenated slug.
 * e.g. "Spicy Pork Stir-Fry" -> "spicy-pork-stir-fry"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse a Square catalog item name in the format "English Name (한글)".
 * Returns { nameEn, nameKo }.
 */
function parseName(rawName: string): { nameEn: string; nameKo: string } {
  const parenIdx = rawName.lastIndexOf(' (');
  if (parenIdx === -1) {
    return { nameEn: rawName.trim(), nameKo: '' };
  }
  const nameEn = rawName.substring(0, parenIdx).trim();
  let nameKo = rawName.substring(parenIdx + 2).trim();
  if (nameKo.endsWith(')')) {
    nameKo = nameKo.slice(0, -1);
  }
  return { nameEn, nameKo };
}

// ── Main export ──

/**
 * Fetch menu items from the Square Catalog API and map them to MenuItem[].
 * Optionally filter by category ('main' | 'banchan').
 */
export async function getSquareCatalogItems(
  category?: string
): Promise<MenuItem[]> {
  try {
    const client = getSquareClient();

    // Fetch all ITEM catalog objects
    const itemPage = await client.catalog.list({ types: 'ITEM' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawItems: any[] = itemPage.data ?? [];

    // Fetch all IMAGE catalog objects (paginated) and build a lookup by ID
    const imageMap: Record<string, string> = {};
    let imgCursor: string | undefined;
    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imagePage: any = await client.catalog.list({ types: 'IMAGE', cursor: imgCursor });
      for (const obj of imagePage.data ?? []) {
        if (obj.id && obj.imageData?.url) {
          imageMap[obj.id] = obj.imageData.url;
        }
      }
      imgCursor = imagePage.response?.cursor ?? undefined;
    } while (imgCursor);

    // Map Square catalog objects to MenuItem[]
    const menuItems: MenuItem[] = [];

    for (const item of rawItems) {
      const itemData = item.itemData;
      if (!itemData) continue;

      // Determine category from the item's categoryId
      const categoryId = itemData.categoryId || itemData.categories?.[0]?.id;
      const itemCategory: ItemCategory | undefined = categoryId
        ? CATEGORY_MAP[categoryId]
        : undefined;

      // Skip items that don't belong to a known category
      if (!itemCategory) continue;

      // Apply category filter if provided
      if (category && itemCategory !== category) continue;

      // Parse the name
      const rawName: string = itemData.name || '';
      const { nameEn, nameKo } = parseName(rawName);
      const slug = slugify(nameEn);

      // Extract price from the first variation
      let price = 0;
      const variations = itemData.variations;
      if (variations && variations.length > 0) {
        const priceMoney =
          variations[0].itemVariationData?.priceMoney;
        if (priceMoney?.amount != null) {
          price = Number(priceMoney.amount) / 100;
        }
      }

      // Get description
      const description: string = itemData.description || '';

      // Get image URL from linked image IDs
      let imageUrl: string | undefined;
      const imageIds: string[] = itemData.imageIds || [];
      if (imageIds.length > 0 && imageMap[imageIds[0]]) {
        imageUrl = imageMap[imageIds[0]];
      }

      // Look up enrichment data
      const enrichment = ENRICHMENT_DATA[slug];

      // Default serving size based on category
      const servingSize = itemCategory === 'banchan' ? '6 oz' : '12 oz';

      const menuItem: MenuItem = {
        id: slug,
        nameKo,
        nameEn,
        description,
        price,
        category: itemCategory,
        dietaryTags: enrichment?.dietaryTags ?? [],
        imageUrl,
        available: true,
        soldOut: false,
        servingSize,
        spiceLevel: enrichment?.spiceLevel,
        subcategory: enrichment?.subcategory,
        badges: enrichment?.badges,
        note: enrichment?.note,
        review: enrichment?.review,
      };

      menuItems.push(menuItem);
    }

    return menuItems;
  } catch (error) {
    console.error(
      '[square-catalog] Failed to fetch catalog items:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

/**
 * Fetch featured items from Square. Checks "This Weeks Highlights" category first.
 * Sylvia can manage featured items by adding/removing from that category in Square dashboard.
 * Falls back to first 4 items across all categories if no featured items are set.
 */
export async function getSquareFeaturedItems(): Promise<MenuItem[]> {
  try {
    const client = getSquareClient();
    const itemPage = await client.catalog.list({ types: 'ITEM' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allItems: any[] = itemPage.data ?? [];

    // Find items in the Featured category
    const featuredRaw = allItems.filter((item) => {
      const cats = item.itemData?.categories || [];
      return cats.some((c: { id?: string }) => c.id === FEATURED_CATEGORY_ID);
    });

    if (featuredRaw.length > 0) {
      // Build image map for these items
      const imageMap: Record<string, string> = {};
      let imgCursor: string | undefined;
      do {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imagePage: any = await client.catalog.list({ types: 'IMAGE', cursor: imgCursor });
        for (const obj of imagePage.data ?? []) {
          if (obj.id && obj.imageData?.url) imageMap[obj.id] = obj.imageData.url;
        }
        imgCursor = imagePage.response?.cursor ?? undefined;
      } while (imgCursor);

      return featuredRaw.slice(0, 4).map((item) => {
        const itemData = item.itemData;
        const { nameEn, nameKo } = parseName(itemData?.name || '');
        const slug = slugify(nameEn);
        let price = 0;
        const variations = itemData?.variations;
        if (variations?.[0]?.itemVariationData?.priceMoney?.amount != null) {
          price = Number(variations[0].itemVariationData.priceMoney.amount) / 100;
        }
        const imageIds: string[] = itemData?.imageIds || [];
        const imageUrl = imageIds.length > 0 ? imageMap[imageIds[0]] : undefined;
        const enrichment = ENRICHMENT_DATA[slug];
        const categoryId = itemData?.categoryId || itemData?.categories?.[0]?.id;
        const itemCategory = categoryId ? (CATEGORY_MAP[categoryId] || 'banchan') : 'banchan';
        return {
          id: slug, nameKo, nameEn, description: itemData?.description || '', price,
          category: itemCategory, dietaryTags: enrichment?.dietaryTags ?? [],
          imageUrl, available: true, soldOut: false,
          servingSize: itemCategory === 'banchan' ? '6 oz' : '12 oz',
          spiceLevel: enrichment?.spiceLevel, subcategory: enrichment?.subcategory,
          badges: enrichment?.badges, note: enrichment?.note, review: enrichment?.review,
        } as MenuItem;
      });
    }
  } catch (err) {
    console.error('[square-catalog] Featured fetch error:', err instanceof Error ? err.message : err);
  }

  // Fallback: mix of items from all categories
  const allItems = await getSquareCatalogItems();
  return allItems.slice(0, 4);
}
