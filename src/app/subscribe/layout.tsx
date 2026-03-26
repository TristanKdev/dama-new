import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe — Coming Soon',
  description: 'Subscription service coming soon. Stay tuned for weekly Korean dosirak and banchan delivery in Jersey City.',
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
