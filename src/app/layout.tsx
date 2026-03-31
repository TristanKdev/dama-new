import type { Metadata } from 'next';
import { cormorant, dmSans, notoSansKR } from '@/lib/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { SocialPopup } from '@/components/ui/SocialPopup';

import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://damajc.com'),
  title: {
    default: 'DAM:A — Simply Wholesome | Korean Wellness Food in Jersey City',
    template: '%s | DAM:A',
  },
  description: 'Thoughtfully prepared Korean meals, curated for your everyday balance. Fresh banchan and dosirak delivered to your building in Jersey City, NJ.',
  keywords: [
    'Korean food Jersey City', 'banchan delivery', 'dosirak meal box', 'Korean meal delivery NJ',
    'Korean wellness food', 'healthy Korean food', 'Korean side dishes delivery',
    'banchan Jersey City', 'Korean lunch box delivery', 'dosirak box NJ',
    'Korean catering Jersey City', 'bibimbap banchan', 'Korean food near me',
    'Korean meal prep', 'authentic Korean food delivery', 'Korean food 07302',
    'DAM:A', 'damajc', 'Korean restaurant Jersey City', 'banchan subscription',
    'weekly Korean meals', 'Korean office lunch delivery', 'building delivery Korean food',
    'kimchi Jersey City', 'Korean food delivery 07302 07304 07306 07310',
    'Korean royal catering', 'SURA catering', 'kimchi class Jersey City',
    'Korean food hoboken', 'banchan near me', 'Korean dosirak NJ',
    'Korean food delivery downtown Jersey City', 'Korean food waterfront JC',
    'Party DAM:A catering', 'Korean wellness meals', 'Korean home cooking delivery',
  ],
  authors: [{ name: 'DAM:A' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'DAM:A',
    title: 'DAM:A — Simply Wholesome | Korean Wellness Food',
    description: 'Thoughtfully prepared Korean meals, curated for your everyday balance. Delivered in Jersey City.',
    images: [{ url: '/images/logo/logo-green.png', width: 1200, height: 560, alt: 'DAM:A — Simply Wholesome Korean Meals' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DAM:A — Simply Wholesome Korean Meals',
    description: 'Thoughtfully prepared Korean meals, curated for your everyday balance. Delivered in Jersey City.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${notoSansKR.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-dama-green">
          Skip to main content
        </a>
        <AuthProvider>
          <AnnouncementBanner />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <CartDrawer />
          <SocialPopup />

        </AuthProvider>
      </body>
    </html>
  );
}
