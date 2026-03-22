import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe & Save',
  description: 'Subscribe to weekly Korean banchan delivery in Jersey City. Get a curated box of 5-6 rotating side dishes delivered on your schedule and save 10%.',
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
