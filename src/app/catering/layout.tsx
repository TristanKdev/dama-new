import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Party DAM:A — Korean Catering in Jersey City',
  description: 'Korean banchan catering for events, office lunches, and parties in Jersey City. Custom dosirak spreads, banchan platters, and seasonal specialties for gatherings of 10+. Request a quote today.',
  openGraph: {
    title: 'Party DAM:A — Korean Catering for Events & Offices',
    description: 'Elevate your next event with authentic Korean banchan and dosirak catering. Custom menus for corporate lunches, birthday parties, and celebrations.',
    images: [{ url: '/images/brand/catering.webp', width: 1200, height: 630, alt: 'DAM:A Korean catering spread for events' }],
  },
  alternates: {
    canonical: '/catering',
  },
};

export default function CateringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
