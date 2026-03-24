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
  flavorProfile?: string;
  texture?: string;
  pairsWellWith?: string;
  chefsNote?: string;
}

const ENRICHMENT_DATA: Record<string, EnrichmentEntry> = {
  // Main Dishes
  'spicy-pork-stir-fry': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Spicy', 'Best Seller', 'High Protein'],
    review: 'The spice level is spot on. The vegetable ratio is balanced. Mix it into rice and it still has plenty of flavor \u2014 never bland.',
    flavorProfile: 'Bold, spicy, savory with a caramelized gochujang base. Rich and deeply satisfying.',
    texture: 'Tender sliced pork with well-seasoned vegetables throughout.',
    pairsWellWith: 'Steamed rice (essential), kimchi, sesame spinach',
    chefsNote: 'Thinly sliced pork belly and shoulder stir-fried with a house gochujang marinade and crisp vegetables. The signature Korean working-lunch main.',
  },
  'korean-beef-bulgogi': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Best Seller', 'Kids Favorite', 'High Protein', 'Mild'],
    review: 'Children\u2019s absolute favorite. Disappeared before anything else on the table.',
    flavorProfile: 'Sweet, savory, and deeply umami. The marinade is built on soy, sesame, and Asian pear.',
    texture: 'Thin, tender slices of beef. Silky and satisfying.',
    pairsWellWith: 'Rice, sesame spinach, lettuce wraps (ssam), Korean beer or soju',
    chefsNote: 'Marinated sliced beef cooked until just caramelized. The most universally loved Korean main \u2014 approachable for all ages and first-time Korean food experiences.',
  },
  'gimbap-korean-rice-roll': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Best Seller', 'Kids Favorite'],
    flavorProfile: 'Savory, balanced, clean. Sesame oil-scented rice with layered fillings.',
    texture: 'Compact, satisfying. Each slice holds its shape cleanly.',
    pairsWellWith: 'Danmuji (pickled radish), kimchi, barley tea',
    chefsNote: 'Classic Korean rice rolls filled with egg, spinach, carrot, pickled radish, and protein. Hand-rolled and sliced to order. Best enjoyed fresh, same day.',
  },
  'braised-mackerel': {
    dietaryTags: ['Spicy'],
    spiceLevel: 1,
    badges: ['High Protein', 'Spicy'],
    flavorProfile: 'Bold, savory, spiced. The braising sauce soaks into the fish for a deeply seasoned bite.',
    texture: 'Flaky fish in a thick, reduced braising sauce.',
    pairsWellWith: 'Rice (the sauce is excellent over rice), white kimchi, seasoned bean sprouts',
    chefsNote: 'Mackerel braised in a gochujang and soy-based sauce with radish and aromatics. A weekday Korean table staple.',
  },
  'pork-ribs-in-soy-glaze': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['High Protein', 'Best Seller'],
    flavorProfile: 'Rich, savory, slightly sweet. The glaze caramelizes beautifully.',
    texture: 'Fall-off-the-bone tender with a sticky, caramelized exterior.',
    pairsWellWith: 'Steamed rice, pickled vegetables, Korean beer',
    chefsNote: 'Pork short ribs braised and finished in a house soy-based glaze. A hearty, crowd-pleasing main for gatherings and events.',
  },
  'chicken-galbi': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Spicy', 'High Protein', 'Best Seller'],
    flavorProfile: 'Spicy-sweet, bold, with gochujang and soy. Rich and satisfying.',
    texture: 'Tender chicken with a slight char. Vegetables cooked in the same sauce.',
    pairsWellWith: 'Steamed rice, cabbage leaves for wrapping, Korean beer',
    chefsNote: 'Chuncheon-style chicken stir-fried with rice cakes, cabbage, and sweet potato in a spiced gochujang sauce. A Korean crowd favorite.',
  },
  'beef-short-rib-galbi': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['High Protein', 'Signature', 'Best Seller'],
    flavorProfile: 'Rich, savory, deeply umami with a caramelized soy-sesame base.',
    texture: 'Minced beef formed into a patty style, grilled to a slight char. Dense and satisfying.',
    pairsWellWith: 'Steamed rice, sesame spinach, soy-braised eggs',
    chefsNote: 'Minced beef short rib seasoned and formed in the style of traditional tteokgalbi. A premium, refined main \u2014 ideal for Party DAM:A event boxes.',
  },

  // Banchan
  'kabocha-squash-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Kids Favorite'],
    subcategory: 'muchim',
    review: 'The seasoning is just right. My picky eater, who rarely finishes anything, ate this with rice and nothing else.',
    flavorProfile: 'Mildly sweet with a hint of sesame and light seasoning. Balanced and clean.',
    texture: 'Soft, slightly cubed for bite. Cut smaller on request \u2014 we recommend neat square cuts.',
    pairsWellWith: 'Barley tea, steamed rice, or light green teas during Dado Day',
    chefsNote: 'Seasonal kabocha squash cubed and tossed with a gentle sesame dressing. Vegetables are cut uniformly for a clean, intentional presentation.',
  },
  'seasoned-radish-namul': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
    review: 'Perfect for those who enjoy the radish with a bite to it. Those who prefer softer texture may find this one firm \u2014 but in a good way.',
    flavorProfile: 'Delicate, savory, and lightly seasoned with sesame oil.',
    texture: 'Two styles available: firm and slightly crunchy (preferred by those who like texture) or softer and silkier.',
    pairsWellWith: 'Bibimbap base, steamed rice, barley tea',
    chefsNote: 'A classic Korean table staple. Julienned radish lightly saut\u00e9ed and seasoned with sesame oil and sea salt.',
  },
  'stuffed-cucumber-kimchi': {
    dietaryTags: ['Vegan', 'Spicy'],
    spiceLevel: 2,
    badges: ['Vegan', 'Fermented', 'Spicy'],
    subcategory: 'kimchi',
    note: 'Eat fresh for crunch OR wait 2\u20133 days for deeper fermented flavor.',
    review: 'Crunchy and so refreshing. If you like it fresh, eat it right away. If you like it more fermented, leave it 2\u20133 days.',
    flavorProfile: 'Crisp, tangy, lightly spiced. Refreshing and bright.',
    texture: 'Firm and crunchy. Best enjoyed fresh (day of) for maximum crunch, or after 2\u20133 days for a more developed fermented depth.',
    pairsWellWith: 'Rice, grilled proteins, soju, beer',
    chefsNote: 'Cucumber filled with a seasoned chive and chili mixture. The freshness of cucumber meets the punch of kimchi aromatics.',
  },
  'king-oyster-mushroom-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Best Seller', 'Vegan', 'Mild'],
    subcategory: 'bokkeum',
    review: 'Absolute BEST item. The combination of king oyster mushroom with paprika, chili, and onion is genuinely special. This one disappeared first.',
    flavorProfile: 'Savory, umami-rich, slightly sweet with a hint of heat from the peppers.',
    texture: 'Firm and meaty. The mushroom holds its structure beautifully.',
    pairsWellWith: 'Steamed rice, any protein main dish, Korean lager',
    chefsNote: 'King oyster mushrooms stir-fried with bell peppers, chili, and onion. A simple combination that delivers deep, satisfying flavor.',
  },
  'fernbrake-namul': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
    review: 'The kids loved it \u2014 addictive flavor. Great as a bibimbap component.',
    flavorProfile: 'Earthy, nutty, gently seasoned with soy and sesame.',
    texture: 'Tender and slightly chewy. A satisfying, grounding texture.',
    pairsWellWith: 'Bibimbap, steamed rice, barley tea',
    chefsNote: 'Dried fernbrake (gosari) reconstituted and seasoned with soy sauce, garlic, and sesame. A staple of the Korean table and an essential bibimbap component.',
  },
  'sesame-spinach': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Best Seller'],
    subcategory: 'muchim',
    review: 'The spinach namul, fernbrake, and zucchini together with rice make a perfect bibimbap. A trio that just works.',
    flavorProfile: 'Clean, gently savory, with fragrant sesame oil and a touch of garlic.',
    texture: 'Soft and silky. Lightly blanched for a tender finish.',
    pairsWellWith: 'Rice, fernbrake namul, zucchini stir-fry for a classic bibimbap trio',
    chefsNote: 'Blanched Korean spinach dressed with sesame oil, garlic, and a pinch of salt. One of the three essential namul for bibimbap.',
  },
  'zucchini-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'bokkeum',
    review: 'The namul trio \u2014 radish, spinach, zucchini \u2014 mixed into bibimbap is a revelation. Each one complements the others.',
    flavorProfile: 'Lightly savory, mild, with a subtle sweetness from the zucchini.',
    texture: 'Soft with a slight bite. Cooked just right to retain shape.',
    pairsWellWith: 'Rice, sesame spinach, fernbrake namul \u2014 bibimbap trio',
    chefsNote: 'Sliced Korean zucchini (aehobak) lightly saut\u00e9ed with garlic and sesame. A gentle, crowd-pleasing banchan.',
  },
  'fish-cake-stir-fry': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild'],
    subcategory: 'bokkeum',
    review: 'A comforting, familiar banchan. Great with rice \u2014 the sauce is the star.',
    flavorProfile: 'Savory, slightly sweet, with soy-based seasoning and a hint of chili.',
    texture: 'Chewy and satisfying. Fish cake holds up beautifully after cooking.',
    pairsWellWith: 'Steamed rice, Korean lager, soju',
    chefsNote: 'Korean fish cake (eomuk) sliced and stir-fried with vegetables in a savory-sweet soy glaze. A classic Korean school lunch and street food staple.',
  },
  'seasoned-bean-sprouts': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
    review: 'Refreshing and light. A great palate cleanser between heavier bites.',
    flavorProfile: 'Clean, bright, and lightly seasoned with sesame, garlic, and a touch of chili.',
    texture: 'Crisp and refreshing. Blanched briefly to retain the natural crunch.',
    pairsWellWith: 'Rice, any protein, barley tea',
    chefsNote: 'Fresh bean sprouts blanched and seasoned with sesame oil, garlic, and soy. A light, cleansing banchan that balances richer dishes.',
  },
  'soy-braised-eggs': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild', 'High Protein', 'Best Seller'],
    subcategory: 'jorim',
    review: 'The leftover soy braising sauce is incredible \u2014 mix it into rice, use it to dip the tofu. Do not waste a drop.',
    flavorProfile: 'Deep umami, savory, gently sweet. The braising soy sauce is as good as the eggs.',
    texture: 'Firm-set egg with a silky, deeply seasoned exterior.',
    pairsWellWith: 'Rice \u2014 the leftover braising sauce is perfect as a rice seasoning. Also pairs with tofu for dipping.',
    chefsNote: 'Eggs slow-braised in a soy-based sauce with a touch of sugar and aromatics. The sauce is intentionally made to be enjoyed long after the eggs are gone.',
  },
  'glass-noodle-stir-fry-japchae': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Best Seller', 'Vegan'],
    subcategory: 'bokkeum',
    note: 'Best enjoyed same day. Texture changes after 24 hours.',
    review: 'Eat this first \u2014 it goes off fastest. Best consumed same day. After one day, the texture changes. Don\u2019t wait.',
    flavorProfile: 'Savory, slightly sweet, nutty. Seasoned with sesame oil and soy sauce.',
    texture: 'Chewy, silky, and satisfying. Glass noodles (dangmyeon) absorb the sauce perfectly.',
    pairsWellWith: 'Rice, Korean celebrations, makgeolli (rice wine)',
    chefsNote: 'Sweet potato glass noodles stir-fried with vegetables and seasoned with sesame oil and soy. A festive Korean staple, best enjoyed on the day of delivery.',
  },
  'pan-fried-tofu': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'bokkeum',
    review: 'Did not even need the dipping sauce. So rich and nutty on its own. The texture is exactly right.',
    flavorProfile: 'Rich, savory, and slightly nutty. Crisp on the outside, soft inside.',
    texture: 'Golden crust with a tender center. Standalone delicious \u2014 no dipping sauce needed.',
    pairsWellWith: 'Included soy dipping sauce, braised egg sauce, steamed rice',
    chefsNote: 'Firm tofu sliced and pan-fried to a golden finish. Served with a house soy dipping sauce, though the tofu is excellent on its own.',
  },
  'broccoli-tofu-stir-fry': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Gluten-Friendly'],
    subcategory: 'bokkeum',
    review: 'Note: vegetables are intentionally cut smaller \u2014 same size as the tofu inside the stir-fry. Uniform for a reason.',
    flavorProfile: 'Clean, savory, lightly seasoned.',
    texture: 'Tofu is soft, broccoli retains a slight crunch.',
    pairsWellWith: 'Rice, sesame spinach, barley tea',
    chefsNote: 'A lighter, plant-forward banchan combining tofu and broccoli in a simple soy-garlic stir-fry. The vegetables are cut uniformly to match the same size as the tofu.',
  },
  'burdock-root-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'jorim',
    flavorProfile: 'Savory, subtly sweet, deeply seasoned with soy and a touch of honey.',
    texture: 'Firm, slightly chewy. A satisfying crunch with every bite.',
    pairsWellWith: 'Rice, soy-braised eggs, any protein main',
    chefsNote: 'Burdock root (ueong) slow-braised in a soy glaze until caramelized and tender. A traditional Korean table fixture known for its distinct earthy flavor.',
  },
  'lotus-root-stir-fry': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'jorim',
    flavorProfile: 'Savory, subtly sweet, deeply seasoned with soy and a touch of honey.',
    texture: 'Firm, slightly chewy. A satisfying crunch with every bite.',
    pairsWellWith: 'Rice, soy-braised eggs, any protein main',
    chefsNote: 'Burdock root (ueong) slow-braised in a soy glaze until caramelized and tender. A traditional Korean table fixture known for its distinct earthy flavor.',
  },
  'seasoned-sea-vegetable-wakame': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Gluten-Friendly'],
    subcategory: 'muchim',
    flavorProfile: 'Briny, clean, and refreshing with sesame and light vinegar notes.',
    texture: 'Silky and smooth. A palate-cleansing side.',
    pairsWellWith: 'Rice, grilled fish, any lighter main dish',
    chefsNote: 'Fresh sea vegetable seasoned with sesame oil, soy, and rice vinegar. Light and mineral-forward.',
  },
  'mung-bean-sprout-namul': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild'],
    subcategory: 'muchim',
    flavorProfile: 'Earthy, subtly sweet, lightly seasoned.',
    texture: 'Tender and slightly fibrous.',
    pairsWellWith: 'Rice, bibimbap, barley tea',
    chefsNote: 'A wholesome, understated banchan. Mung bean sprouts seasoned simply to let the natural flavor come through.',
  },
  'seasoned-squid-ojingeo-muchim': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Anju', 'Spicy', 'Drink Pairing'],
    subcategory: 'muchim',
    review: 'Perfect beer pairing for Korean palates. May be a new experience for those unfamiliar with dried seafood banchan \u2014 but worth the try.',
    flavorProfile: 'Bold, spicy, and savory with gochujang-based seasoning.',
    texture: 'Chewy and satisfying. Classic Korean bar food texture.',
    pairsWellWith: 'Korean lager, soju, makgeolli \u2014 the definitive Korean anju',
    chefsNote: 'Squid seasoned with a gochujang-based sauce, sesame, and aromatics. A beloved Korean bar snack (anju) that pairs perfectly with cold drinks.',
  },
  'seasoned-squid-ojingeo-muchim': {
    dietaryTags: ['Spicy'],
    spiceLevel: 2,
    badges: ['Anju', 'Spicy', 'Drink Pairing'],
    subcategory: 'muchim',
    review: 'Perfect beer pairing for Korean palates. May be a new experience for those unfamiliar with dried seafood banchan \u2014 but worth the try.',
    flavorProfile: 'Bold, spicy, and savory with gochujang-based seasoning.',
    texture: 'Chewy and satisfying. Classic Korean bar food texture.',
    pairsWellWith: 'Korean lager, soju, makgeolli \u2014 the definitive Korean anju',
    chefsNote: 'Squid seasoned with a gochujang-based sauce, sesame, and aromatics. A beloved Korean bar snack (anju) that pairs perfectly with cold drinks.',
  },
  'potato-egg-salad': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild', 'Kids Favorite'],
    subcategory: 'muchim',
    flavorProfile: 'Creamy, mildly savory, comforting.',
    texture: 'Soft and smooth with slight potato chunks.',
    pairsWellWith: 'Any dosirak, sandwiches, kids\u2019 meals',
    chefsNote: 'A Korean-style potato salad with egg, lightly dressed for a creamy, satisfying side. Universally loved across ages.',
  },
  'sweet-corn-vegetable-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Kids Favorite'],
    subcategory: 'muchim',
    flavorProfile: 'Sweet, creamy, and light.',
    texture: 'Soft with a gentle crunch from the vegetables.',
    pairsWellWith: 'Any dosirak box, bibimbap',
    chefsNote: 'A sweet potato and vegetable salad lightly dressed for brightness. A colorful, crowd-pleasing addition.',
  },
  'pan-fried-dumplings-mandu': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['High Protein', 'Best Seller'],
    subcategory: 'bokkeum',
    flavorProfile: 'Savory, umami-rich filling with a crispy, golden exterior.',
    texture: 'Crispy skin with a juicy, satisfying filling.',
    pairsWellWith: 'Soy dipping sauce, rice, Korean beer',
    chefsNote: 'Traditional Korean dumplings pan-fried to a golden crisp. Filled with seasoned meat and vegetables. Best eaten fresh.',
  },
  'korean-egg-roll-gyeran-mari': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Mild', 'Kids Favorite'],
    subcategory: 'bokkeum',
    flavorProfile: 'Delicate, savory, slightly sweet. Simple and satisfying.',
    texture: 'Soft layers with a gentle firmness. Light and airy.',
    pairsWellWith: 'Rice, soy sauce, any dosirak box',
    chefsNote: 'Rolled Korean omelette with vegetables folded inside. A classic lunchbox staple that appeals to every age group.',
  },
  'napa-cabbage-kimchi': {
    dietaryTags: ['Vegan', 'Spicy'],
    spiceLevel: 2,
    badges: ['Vegan', 'Fermented', 'Spicy', 'Best Seller'],
    subcategory: 'kimchi',
    flavorProfile: 'Classic fermented Korean kimchi \u2014 tangy, spicy, deeply savory with a layered funk.',
    texture: 'Crisp when fresh, softer as it matures. Choose your preference.',
    pairsWellWith: 'Everything. Rice, grilled meats, tofu, ramyeon, eggs.',
    chefsNote: 'House-made baechu kimchi using traditional seasoning. The foundation of the Korean table. Ferments over time for increasing depth.',
  },
  'radish-kimchi-kkakdugi': {
    dietaryTags: ['Vegan', 'Spicy'],
    spiceLevel: 2,
    badges: ['Vegan', 'Fermented', 'Spicy'],
    subcategory: 'kimchi',
    flavorProfile: 'Bold, crunchy, and refreshing with a spiced fermented tang.',
    texture: 'Firm, juicy, and satisfying crunch.',
    pairsWellWith: 'Rice, soup, grilled proteins',
    chefsNote: 'Cubed radish kimchi fermented with gochugaru and aromatics. Especially good alongside rich, fatty dishes to cut through the richness.',
  },
  'white-kimchi-baek-kimchi': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Fermented', 'Mild', 'Gluten-Friendly'],
    subcategory: 'kimchi',
    flavorProfile: 'Mild, refreshing, and slightly sweet. No chili. Clean and bright.',
    texture: 'Crisp, juicy, and cool on the palate.',
    pairsWellWith: 'Grilled meats, pork belly, lighter dishes, guests who don\u2019t eat spice',
    chefsNote: 'Non-spicy kimchi for those who want the probiotic depth and fermented complexity without the heat. Elegant and versatile.',
  },
  'steamed-rice-cake': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Seasonal'],
    flavorProfile: 'Neutral, mildly sweet, clean.',
    texture: 'Soft, chewy, pillowy. The essence of Korean tteok.',
    pairsWellWith: 'Tea (especially Dado Day), honey, sesame dipping',
    chefsNote: 'Classic plain tteok. Soft and satisfying on their own or paired with a cup of Korean tea for a Dado Day moment.',
  },
  'assorted-flavored-rice-cakes': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Seasonal', 'Best Seller'],
    flavorProfile: 'Varies by selection: sweet red bean, sesame, mugwort, or honey.',
    texture: 'Soft, chewy, layered. Each variety has a distinct bite.',
    pairsWellWith: 'Korean tea, Dado Day setting, dessert course',
    chefsNote: 'A curated selection of seasonal and traditional flavored tteok. Beautiful on a platter and ideal for gifting, events, and Dado Day presentations.',
  },
  'acorn-jelly-dotori-muk': {
    dietaryTags: ['Vegan', 'Gluten-Friendly'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'Gluten-Friendly'],
    flavorProfile: 'Earthy, subtly nutty, and mild. Takes on seasoning beautifully.',
    texture: 'Silky and firm. Slices cleanly and holds its shape.',
    pairsWellWith: 'Soy-sesame dressing, kimchi, rice',
    chefsNote: 'Acorn jelly sliced and served with a house seasoning. A traditional Korean cold side with a uniquely earthy profile unlike any other banchan.',
  },
  'yuzu-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Seasonal', 'Mild'],
    subcategory: 'muchim',
    flavorProfile: 'Bright, citrusy, refreshing. A palate opener.',
    texture: 'Crisp and light.',
    pairsWellWith: 'Rich proteins, Dado Day tea pairing, light lunches',
    chefsNote: 'A seasonal salad dressed with yuzu citrus. Fragrant and elegant \u2014 a perfect opener for a curated Korean table.',
  },
  'tofu-vegetable-salad': {
    dietaryTags: ['Vegan'],
    spiceLevel: 0,
    badges: ['Vegan', 'Mild', 'High Protein'],
    subcategory: 'muchim',
    flavorProfile: 'Clean, savory, and light. Sesame-forward.',
    texture: 'Soft tofu with crunchy vegetables. Balanced contrast.',
    pairsWellWith: 'Rice, lighter dosirak boxes',
    chefsNote: 'Silken or firm tofu combined with fresh vegetables in a sesame dressing. A clean, protein-forward banchan for lighter meals.',
  },
  'korean-savory-pancake-jeon': {
    dietaryTags: [],
    spiceLevel: 0,
    badges: ['Best Seller', 'Anju', 'Drink Pairing'],
    subcategory: 'bokkeum',
    flavorProfile: 'Savory, golden, and satisfying. Crispy with a chewy interior.',
    texture: 'Crispy on the outside, soft and filled inside.',
    pairsWellWith: 'Makgeolli (rice wine), soy dipping sauce, Korean beer',
    chefsNote: 'Korean savory pancakes made to order by season and occasion \u2014 green onion, kimchi, seafood, or vegetable varieties available. A quintessential Korean anju.',
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
        flavorProfile: enrichment?.flavorProfile,
        texture: enrichment?.texture,
        pairsWellWith: enrichment?.pairsWellWith,
        chefsNote: enrichment?.chefsNote,
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
          flavorProfile: enrichment?.flavorProfile, texture: enrichment?.texture,
          pairsWellWith: enrichment?.pairsWellWith, chefsNote: enrichment?.chefsNote,
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
