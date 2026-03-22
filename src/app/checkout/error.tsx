'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-dama-cream px-4 py-24 text-center">
      <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Checkout Error</h1>
      <p className="mt-3 max-w-md text-base text-dama-charcoal/60">
        Something went wrong during checkout. Your payment has not been processed.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-dama-charcoal/50">Error ID: {error.digest}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Link href="/cart">
          <Button variant="secondary">Back to Cart</Button>
        </Link>
      </div>
    </div>
  );
}
