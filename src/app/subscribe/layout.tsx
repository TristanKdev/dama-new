import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe & Save 10% — Weekly Korean Meal Delivery',
  description: 'Subscribe to weekly Korean dosirak and banchan delivery in Jersey City. Save 10% with auto-delivery every week or biweekly. Choose 4 or 8 banchan per box. Cancel anytime.',
  openGraph: {
    title: 'Subscribe & Save — Weekly Korean Banchan Delivery',
    description: 'Never run out of banchan. Subscribe for weekly or biweekly Korean meal delivery and save 10%. Delivered to your building in Jersey City.',
    images: [{ url: '/images/brand/subscription.webp', width: 1200, height: 630, alt: 'DAM:A weekly Korean banchan subscription box' }],
  },
  alternates: {
    canonical: '/subscribe',
  },
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
