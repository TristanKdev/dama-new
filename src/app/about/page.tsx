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
    images: [{ url: '/images/brand/storefront-new.jpg', width: 1200, height: 630, alt: 'DAM:A storefront at 16 Bright Street, Jersey City' }],
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
      {/* Text-only hero */}
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Contain Wellness</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            About DAM:A
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-dama-charcoal/70">
            DAM:A (담아) means &ldquo;to contain&rdquo; in Korean — the act of carefully filling a vessel
            with something precious. We contain wellness in every bite: balanced nutrition, seasonal ingredients,
            and the deep tradition of Korean home cooking.
          </p>
        </div>
      </div>

      {/* Editorial founder story — 60/40 */}
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="flex flex-col gap-12 md:flex-row">
          <div className="w-full md:w-[60%]">
            <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
              Premium Korean Wellness Food
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-dama-charcoal/70">
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
          <div className="w-full md:w-[40%]">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/photo/dama-full-spread.jpg"
                alt="DAM:A full spread with dosirak, banchan, and tteok"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>

      <VesselDivider />

      {/* Founder Story */}
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-center font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
            Meet Sylvia Kim
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-dama-charcoal/70">
            <p>
              DAM:A was founded by Sylvia Kim, a Korean American chef and food entrepreneur who grew up watching
              her mother and grandmother set the table with seven dishes every evening — not because they had to,
              but because that was what it meant to nourish a family. Those tables were not elaborate. They were intentional.
            </p>
            <p>
              After years in food service and product development, Sylvia returned to those roots. She launched
              DAM:A in Jersey City with a simple mission: bring the Korean wellness table to everyday life, one
              dosirak at a time. Every recipe is developed with balance in mind — seasonal vegetables, slow-fermented
              kimchi, wholesome grains, and proteins that satisfy without excess.
            </p>
            <p>
              Why Jersey City? Because this is a city built on community, diversity, and neighbors who show up
              for each other. DAM:A is not a restaurant — it is a kitchen that delivers to your building, packed
              in reusable glass, ready to eat. Sylvia believes that good food should not require compromise, and
              that Korean home cooking is among the most balanced, nourishing food traditions in the world.
            </p>
          </div>
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

      {/* Editorial image row */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
            <Image
              src="/images/photo/branded-box-angle.jpg"
              alt="DAM:A Beef Set dosirak with bulgogi and seasonal banchan"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
            <Image
              src="/images/photo/banchan-glass-trays.jpg"
              alt="DAM:A banchan selection in glass trays on white background"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
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

      <VesselDivider />

      {/* Dado Day */}
      <div className="bg-dama-black py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-cormorant text-2xl font-semibold text-dama-cream md:text-4xl">
            Dado Day: The Weekend Tea Ritual
          </h2>
          <p className="mt-6 text-base leading-relaxed text-dama-cream/70">
            In Korean tradition, dado (다도) is the practice of tea — not just drinking it, but preparing,
            sharing, and savoring it with intention. At DAM:A, we celebrate Dado Day every weekend as an
            invitation to slow down. Pair our steamed rice cakes (tteok) or assorted flavored rice cakes
            with a pot of barley tea or Korean green tea. It is a moment of quiet nourishment — for yourself,
            for your family, for anyone who joins you at the table.
          </p>
          <div className="mt-8">
            <Link
              href="/menu"
              className="inline-block text-sm font-medium uppercase tracking-wider text-dama-green-400 hover:text-dama-green-300"
            >
              Explore Our Tteok Selection &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
