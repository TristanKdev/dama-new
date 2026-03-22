import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catering',
  description: 'Korean banchan catering for events and parties in Jersey City. Custom spreads, dosirak boxes, and seasonal specialties for gatherings of 10 or more.',
};

export default function CateringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
