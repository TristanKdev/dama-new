'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isSafeRedirectPath } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/account';
  const redirect = isSafeRedirectPath(rawRedirect) ? rawRedirect : '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dama-cream py-12 md:py-16">
      <div className="mx-auto max-w-md px-4 md:px-6">
        <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Log In</h1>
        <p className="mt-2 text-sm text-dama-charcoal/60">
          Welcome back to DAM:A.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg bg-white p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-dama-error">{error}</div>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-dama-charcoal/60">
          Don&apos;t have an account?{' '}
          <Link href={redirect !== '/account' ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'} className="font-medium text-dama-green-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
