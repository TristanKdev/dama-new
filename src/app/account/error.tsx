'use client';

import { Button } from '@/components/ui/Button';

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-dama-cream px-4 py-24 text-center">
      <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal">Something went wrong</h1>
      <p className="mt-3 max-w-md text-base text-dama-charcoal/60">
        We couldn&apos;t load your account. Please try again.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-dama-charcoal/50">Error ID: {error.digest}</p>
      )}
      <Button className="mt-6" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
