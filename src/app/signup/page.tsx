'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isSafeRedirectPath } from '@/lib/validation';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '';
  const redirect = rawRedirect && isSafeRedirectPath(rawRedirect) ? rawRedirect : '';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-dama-cream py-12 md:py-16">
        <div className="mx-auto max-w-md px-4 md:px-6">
          <div className="rounded-lg bg-white p-6 text-center">
            <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">
              Check Your Email
            </h1>
            <p className="mt-3 text-sm text-dama-charcoal/60">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>.
              Click the link to activate your account.
            </p>
            <Link href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="mt-6 inline-block">
              <Button variant="secondary" size="sm">Back to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dama-cream py-12 md:py-16">
      <div className="mx-auto max-w-md px-4 md:px-6">
        <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Create Account</h1>
        <p className="mt-2 text-sm text-dama-charcoal/60">
          Join DAM:A to track orders and save your delivery info.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg bg-white p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-dama-error">{error}</div>
          )}

          <Input
            id="fullName"
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Kim"
            required
          />
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
            placeholder="At least 6 characters"
            required
          />

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-dama-charcoal/60">
          Already have an account?{' '}
          <Link href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="font-medium text-dama-green-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
