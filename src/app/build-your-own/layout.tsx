import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Build Your Own Dosirak',
  description: 'Create a custom Korean dosirak box. Choose your tray size, pick from 30 authentic banchan, and build your perfect meal.',
};

export default function BuildYourOwnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
