export const revalidate = 300; // Revalidate every 5 minutes (matches /menu)

import { Hero } from '@/components/sections/Hero';
import { CredibilityBand } from '@/components/sections/CredibilityBand';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { MenuPreview } from '@/components/sections/MenuPreview';
import { EditorialBreak } from '@/components/sections/EditorialBreak';
import { SubscriptionPitch } from '@/components/sections/SubscriptionPitch';
import { BuildingCallout } from '@/components/sections/BuildingCallout';
import { PreFooterCTA } from '@/components/sections/PreFooterCTA';
import { VesselDivider } from '@/components/ui/VesselDivider';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'FoodEstablishment'],
  name: 'DAM:A',
  alternateName: '담아',
  description: 'Handcrafted Korean dosirak meal boxes and banchan delivered to your building in Jersey City, NJ.',
  url: 'https://damajc.com',
  telephone: '(201) 630-0530',
  email: 'hello@damajc.com',
  image: 'https://damajc.com/images/food/dosirak-box-layout.jpg',
  logo: 'https://damajc.com/images/logo/logo-green.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '16 Bright Street Unit H',
    addressLocality: 'Jersey City',
    addressRegion: 'NJ',
    postalCode: '07302',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.7178,
    longitude: -74.0431,
  },
  servesCuisine: 'Korean',
  priceRange: '$$',
  openingHours: ['Tu 11:00-18:00', 'Th 11:00-18:00', 'Sa 11:00-18:00'],
  hasMenu: {
    '@type': 'Menu',
    url: 'https://damajc.com/menu',
  },
  areaServed: {
    '@type': 'City',
    name: 'Jersey City',
    sameAs: 'https://en.wikipedia.org/wiki/Jersey_City,_New_Jersey',
  },
  sameAs: [
    'https://www.instagram.com/damajc2026/',
    'https://facebook.com/damajc', // TODO: Update with correct Facebook URL from client
    'https://tiktok.com/@dama.jc', // TODO: Update with correct TikTok URL from client
  ],
};

const siteLinksSearchBox = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DAM:A',
  url: 'https://damajc.com',
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD: Static hardcoded business + website data, safe to inline (no user input) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLinksSearchBox) }} />
      <Hero />
      <CredibilityBand />
      <VesselDivider />
      <HowItWorks />
      <MenuPreview />
      <EditorialBreak />
      <SubscriptionPitch />
      <VesselDivider />
      <BuildingCallout />
      <PreFooterCTA />
    </>
  );
}
