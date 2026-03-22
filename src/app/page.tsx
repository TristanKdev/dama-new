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
  description: 'Handcrafted Korean banchan (side dishes) delivered to your building in Jersey City, NJ.',
  url: 'https://damajc.com',
  telephone: '(201) 630-0530',
  email: 'hello@damajc.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '16 Bright Street Unit H',
    addressLocality: 'Jersey City',
    addressRegion: 'NJ',
    postalCode: '07302',
    addressCountry: 'US',
  },
  servesCuisine: 'Korean',
  priceRange: '$$',
  openingHours: ['Tu 11:00-18:00', 'Th 11:00-18:00', 'Sa 11:00-18:00'],
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD: Static hardcoded business data, safe to inline */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
