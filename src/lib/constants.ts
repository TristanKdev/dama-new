// ============================================================
// EDIT GUIDE — Business Info
// Change the values below to update your business details.
// These appear across the entire site (header, footer, contact page, etc.).
// After editing, save the file and run: pnpm build
// ============================================================
export const BUSINESS = {
  name: 'DAM:A',           // Business name (shown in header, footer, titles)
  nameKo: '담아',           // Korean name
  tagline: 'Simply Wholesome',  // Shown on homepage hero
  description: 'Thoughtfully prepared Korean meals, curated for your everyday balance. Delivered in Jersey City.',
  email: 'hello@damajc.com',     // Contact email
  phone: '(201) 630-0530',        // Contact phone number
  address: {
    street: '16 Bright Street',     // Street address
    city: 'Jersey City',
    state: 'NJ',
    zip: '07302',
  },
  pickupLocation: {
    name: 'DAM:A Kitchen',
    address: '16 Bright Street Unit H, Jersey City, NJ 07302',
    hours: '',  // Pickup hours removed pending client confirmation
    mapUrl: 'https://maps.google.com/?q=16+Bright+Street+Jersey+City+NJ',
  },
} as const;

// ============================================================
// EDIT GUIDE — Delivery Settings
// Change delivery days, hours, fees, and minimums here.
// NOTE: These are the source of truth for the checkout flow.
// The admin settings page stores values in the DB but the
// frontend currently reads from here. Update values here and
// redeploy when changes are needed.
// ============================================================
export const DELIVERY = {
  days: ['Tuesday', 'Thursday', 'Saturday'] as const,  // Delivery days of the week
  hours: '12:00 PM',                                    // Delivery time shown to customers
  cutoffTime: '10:00 PM',                              // Order cutoff time
  cutoffNote: 'Order by 10 PM the night before your delivery date.',
  freeDeliveryMinimum: 30,   // Orders above this amount ($) get free delivery
  deliveryFee: 3,            // Delivery fee in dollars for orders below the minimum
  minimumOrder: 15,          // Minimum order amount ($)
} as const;

// ============================================================
// EDIT GUIDE — Service Area
// Define the zip codes and city name for your delivery zone.
// Used by the address checker and order validation.
// ============================================================
export const SERVICE_AREA = {
  city: 'Jersey City',
  state: 'NJ',
  cityAbbreviations: ['jc'],  // Short names customers might type
  zipCodes: ['07302', '07304', '07305', '07306', '07307', '07310', '07311'],
} as const;

// ============================================================
// EDIT GUIDE — Social Media Links
// Update these URLs to point to your social profiles.
// ============================================================
export const SOCIAL = {
  instagram: 'https://www.instagram.com/damajc2026/',
  facebook: 'https://www.facebook.com/damajc', // TODO: Update with correct Facebook URL from client
  tiktok: 'https://www.tiktok.com/@dama.jc', // TODO: Update with correct TikTok URL from client
} as const;

// ============================================================
// EDIT GUIDE — Navigation Links
// Add, remove, or reorder links here to change the header nav.
// Each entry needs a label (display text) and href (page path).
// ============================================================
// Primary links shown in the desktop header nav
export const NAV_LINKS_PRIMARY: { label: string; href: string }[] = [
  { label: 'Menu', href: '/menu' },
  { label: 'Build Your Own', href: '/build-your-own' },
  { label: 'Subscribe', href: '/subscribe' },
  { label: 'Catering', href: '/catering' },
  { label: 'How It Works', href: '/how-it-works' },
];

// All links (primary + secondary) — used in mobile menu
export const NAV_LINKS: { label: string; href: string }[] = [
  ...NAV_LINKS_PRIMARY,
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
];

// ============================================================
// EDIT GUIDE — Footer Links
// Same idea as NAV_LINKS above, but for the footer columns.
// ============================================================
export const FOOTER_NAV: {
  navigation: { label: string; href: string }[];
  contact: { label: string; href: string }[];
  legal: { label: string; href: string }[];
} = {
  navigation: [
    { label: 'Weekly Menu', href: '/menu' },
    { label: 'Build Your Own', href: '/build-your-own' },
    { label: 'Subscribe', href: '/subscribe' },
    { label: 'Catering', href: '/catering' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About DAM:A', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
  ],
  contact: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Delivery Areas', href: '/delivery-areas' },
    { label: 'Pickup Location', href: '/pickup' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
};
