import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Build Your Own Tray',
  description: 'Create a custom Korean banchan tray. Choose your tray size, pick your favorite side dishes, and arrange them just the way you like.',
};

export default function BuildYourOwnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
