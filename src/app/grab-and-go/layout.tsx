import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grab & Go Tray Builder',
  description: 'Drag and drop your favorite Korean banchan into a custom tray. Choose single or double portions, fill your tray, and check out.',
};

export default function GrabAndGoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
