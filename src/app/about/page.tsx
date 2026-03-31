import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { VesselDivider } from '@/components/ui/VesselDivider';

export const metadata: Metadata = {
  title: 'About DAM:A — Korean Wellness Food in Jersey City',
  description:
    'DAM:A (담아) means "to contain" — we contain wellness in every bite. Founded by Sylvia Kim, DAM:A brings thoughtfully prepared Korean dosirak and banchan to Jersey City buildings. Learn about our mission, the chilcheopbansang tradition, and Party DAM:A catering.',
  openGraph: {
    title: 'About DAM:A — Our Story & Mission',
    description: 'Korean wellness food rooted in the chilcheopbansang tradition. Fresh dosirak and banchan delivered to your building in Jersey City.',
    images: [{ url: '/images/logo/logo-green.png', width: 1200, height: 560, alt: 'DAM:A — About' }],
  },
  alternates: {
    canonical: '/about',
  },
};

const values = [
  { title: 'Balance', description: 'Korean cuisine is built on harmony — flavors, textures, and nutrients in every meal.' },
  { title: 'Wellness', description: 'Seasonal ingredients, wholesome recipes, and thoughtful preparation. Food that nourishes body and mind.' },
  { title: 'Sustainability', description: 'Reusable glass containers, local sourcing, and zero-waste packaging. Good for you and the planet.' },
  { title: 'Community', description: 'Curated for Jersey City. We believe good food brings neighbors together and builds belonging.' },
];

// Static JSON-LD for organization structured data — hardcoded, no user input
const aboutJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DAM:A',
  alternateName: '담아',
  url: 'https://damajc.com',
  logo: 'https://damajc.com/images/logo/logo-green.png',
  description: 'Handcrafted Korean dosirak meal boxes and banchan delivered to your building in Jersey City, NJ.',
  foundingDate: '2024',
  founder: { '@type': 'Person', name: 'Sylvia Kim' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '16 Bright Street Unit H',
    addressLocality: 'Jersey City',
    addressRegion: 'NJ',
    postalCode: '07302',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-201-923-0773',
    email: 'hello@damajc.com',
    contactType: 'customer service',
  },
  sameAs: [
    'https://www.instagram.com/damajc2026/',
    'https://www.facebook.com/share/1LYk6cb6X6/?mibextid=wwXIfr',
    'https://www.tiktok.com/@damajc2026',
  ],
});

export default function AboutPage() {
  return (
    <div className="bg-dama-cream">
      {/* JSON-LD: Static hardcoded organization data, safe to inline */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: aboutJsonLd }} />
      {/* Hero with logo */}
      <div className="py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <Image
            src="/images/logo/logo-green.png"
            alt="DAM:A logo"
            width={200}
            height={93}
            className="mx-auto mb-6"
            style={{ width: 'auto', height: 'auto' }}
          />
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Contain Wellness</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            About DAM:A
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-dama-charcoal/70">
            DAM:A (담아) means &ldquo;to contain&rdquo; in Korean — the act of carefully filling a vessel
            with something precious. We contain wellness in every bite: balanced nutrition, seasonal ingredients,
            and the deep tradition of Korean home cooking.
          </p>
        </div>
      </div>

      {/* Premium Korean Wellness Food */}
      <div className="mx-auto max-w-4xl px-4 pb-12 md:px-6 md:pb-16">
        <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
          Premium Korean Wellness Food
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-dama-charcoal/70">
          <p>
            In Korean tradition, a well-set table tells a story of balance — flavors, textures, and nutrients
            working in harmony. DAM:A was born from the belief that this balance should not be a luxury reserved
            for special occasions. It should be part of your everyday life.
          </p>
          <p>
            We prepare every meal with intention: seasonal ingredients, time-honored recipes, and the kind of care
            that turns simple ingredients into nourishing food. From our signature dosirak sets to our curated
            banchan selections, every item is designed to bring Korean wellness to your table.
          </p>
          <p>
            Based in Jersey City, DAM:A delivers freshly prepared meals straight to your building — packed in
            reusable glass containers, ready to eat. Because eating well should not require compromise.
          </p>
        </div>
      </div>

      <VesselDivider />

      {/* Chilcheopbansang Tradition */}
      <div className="bg-dama-black py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-cormorant text-2xl font-semibold text-dama-cream md:text-4xl">
            The Chilcheopbansang Tradition
          </h2>
          <p className="mt-6 text-base leading-relaxed text-dama-cream/70">
            In Korean culture, the chilcheopbansang (칠첩반상) is a table set with seven dishes — rice,
            soup, and five banchan. It is the foundation of Korean home dining: not extravagant, but complete.
            Every element serves a purpose. Every flavor has its counterpart. DAM:A meals are built on this
            principle. When you open a dosirak, you are sitting at a table that has been set with intention.
          </p>
        </div>
      </div>

      {/* Our Philosophy */}
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-4xl">
            Our Philosophy
          </h2>
          <p className="mt-6 text-base leading-relaxed text-dama-charcoal/70">
            Korean cuisine has always been wellness food — built on the principle that what you eat shapes
            how you live. Seasonal vegetables, fermented foods, balanced flavors — these are not trends.
            They are centuries of wisdom passed down through generations.
          </p>
          <p className="mt-4 text-base leading-relaxed text-dama-charcoal/70">
            At DAM:A, we honor that tradition. Every meal is thoughtfully prepared with fresh, seasonal
            ingredients. We ferment our kimchi slowly. We source locally. And we pack everything in reusable
            glass — because wellness extends to the planet too.
          </p>
        </div>
      </div>

      {/* Menu images grid */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[
            { src: '/images/food/dosirak-classic-box.jpg', alt: 'DAM:A Chicken Set dosirak' },
            { src: '/images/food/dosirak-premium-box.jpg', alt: 'DAM:A Spicy Pork Set dosirak' },
            { src: '/images/food/dosirak-bulgogi-box.jpg', alt: 'DAM:A Beef Set dosirak' },
            { src: '/images/food/dosirak-japchae.jpg', alt: 'DAM:A Japchae dosirak' },
            { src: '/images/food/dosirak-k-yubu-chobap.jpg', alt: 'DAM:A K-Yubu Chobap' },
            { src: '/images/food/dosirak-k-inari.jpg', alt: 'DAM:A K-Inari dosirak' },
            { src: '/images/food/dosirak-lunch.jpg', alt: 'DAM:A lunch dosirak spread' },
          ].map((img) => (
            <div key={img.src} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-lg bg-white p-8"
              >
                <h3 className="text-lg font-semibold text-dama-charcoal">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dama-charcoal/60">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VesselDivider />

      {/* Party DAM:A */}
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-center font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
            Party DAM:A
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-dama-charcoal/70">
            <p>
              Hosting a gathering, office event, or celebration? Party DAM:A brings the Korean table to your
              occasion. Our catering boxes are built around the same philosophy as our everyday meals — balanced,
              beautiful, and designed to be shared. Choose from curated tray options featuring our best-selling
              banchan, signature main dishes like Beef Short Rib Galbi (Tteokgalbi), and assorted rice cakes.
              Every Party DAM:A order is packed in presentation-ready containers and delivered to your venue
              in Jersey City.
            </p>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/catering"
              className="inline-block text-sm font-medium uppercase tracking-wider text-dama-green-600 hover:text-dama-green-700"
            >
              Inquire About Catering &rarr;
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
