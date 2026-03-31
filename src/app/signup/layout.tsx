import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a DAM:A account to track orders, save your delivery address, and manage your banchan subscriptions.',
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
