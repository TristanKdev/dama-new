import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function PreFooterCTA() {
  return (
    <section className="bg-dama-green-50 py-16 md:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
          Choose. Contain. Enjoy.
        </h2>
        <p className="mt-3 text-base text-dama-charcoal/70">
          Start your Korean wellness journey — browse the menu and order today.
        </p>
        <Link href="/menu" className="mt-6 inline-block">
          <Button size="lg">Order Now</Button>
        </Link>
      </div>
    </section>
  );
}
