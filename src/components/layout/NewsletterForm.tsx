'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p className="text-sm text-dama-green-400">Thanks for subscribing!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {status === 'error' && (
        <p className="text-sm text-red-300">Something went wrong. Please try again.</p>
      )}
      <div className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Email address for newsletter"
        required
        className="w-full rounded-md bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-dama-green-400"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="shrink-0 rounded-md bg-dama-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-dama-green-600 disabled:opacity-50"
      >
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
      </div>
    </form>
  );
}
