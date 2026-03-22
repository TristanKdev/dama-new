import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-dama-cream px-4 py-24 text-center">
      <span className="font-cormorant text-8xl font-bold text-dama-green-400/30">404</span>
      <h1 className="mt-4 font-cormorant text-3xl font-semibold text-dama-charcoal">Page Not Found</h1>
      <p className="mt-3 max-w-md text-base text-dama-charcoal/60">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or no longer exists.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/menu">
          <Button variant="secondary">View Menu</Button>
        </Link>
      </div>
    </div>
  );
}
