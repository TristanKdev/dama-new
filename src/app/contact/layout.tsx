import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact DAM:A — Korean Food Delivery in Jersey City',
  description: 'Get in touch with DAM:A. Questions about Korean meal delivery, dosirak orders, banchan subscriptions, or Party DAM:A catering in Jersey City? We respond within 24 hours.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
