'use client';

import { Button } from '@/components/ui/Button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-dama-charcoal/60">
        An error occurred in the admin panel. Please try again.
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
