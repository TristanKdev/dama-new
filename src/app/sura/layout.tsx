import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SURA by DAM:A — Korean Royal Catering',
  description:
    'SURA is a premium Korean royal catering experience by DAM:A. Curated multi-course Korean dining for corporate galas, weddings, hotel venues, and milestone celebrations across the Greater NYC Metro.',
  openGraph: {
    title: 'SURA by DAM:A — Korean Royal Catering',
    description:
      'Once prepared for a king. Now set before someone just as precious. Premium Korean royal catering for venues, hotels, and extraordinary events.',
    images: [
      {
        url: '/images/logo/logo-green.png',
        width: 1200,
        height: 560,
        alt: 'SURA by DAM:A — Korean Royal Catering',
      },
    ],
  },
  alternates: {
    canonical: '/sura',
  },
};

export default function SuraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
