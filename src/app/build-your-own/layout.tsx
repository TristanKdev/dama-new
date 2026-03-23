import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Build Your Own Dosirak — Custom Korean Meal Box',
  description: 'Create a custom Korean dosirak box with your choice of protein, rice, and banchan sides. Choose from 30 authentic Korean side dishes. Build your perfect meal and order online for delivery in Jersey City.',
  openGraph: {
    title: 'Build Your Own Dosirak — DAM:A Custom Korean Meal Box',
    description: 'Pick your protein, fill each compartment with banchan, and build the perfect Korean meal box. 30 authentic side dishes to choose from.',
    images: [{ url: '/images/food/dosirak-box-layout.jpg', width: 1200, height: 1200, alt: 'DAM:A Dosirak Box builder — 8 compartments for your custom Korean meal' }],
  },
  alternates: {
    canonical: '/build-your-own',
  },
};

export default function BuildYourOwnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
