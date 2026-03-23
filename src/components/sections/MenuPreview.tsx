import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { dosirakSets } from '@/data/dosirak-sets';
import { formatPrice } from '@/lib/utils';

export async function MenuPreview() {
  return (
    <section className="bg-dama-cream py-16 md:py-24" aria-labelledby="menu-preview-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12">
          <p className="font-noto-kr text-sm text-dama-green-600">도시락</p>
          <h2 id="menu-preview-heading" className="mt-1 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            Our Dosirak Sets
          </h2>
          <p className="mt-2 text-base text-dama-charcoal/60">
            Complete Korean meal boxes — choose your set, add banchan sides, and enjoy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {dosirakSets.map((set) => (
            <div key={set.id} className="group overflow-hidden rounded-2xl border border-dama-sand/50 bg-white transition-shadow hover:shadow-xl">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={set.imageUrl}
                  alt={set.nameEn}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {set.badges.map(badge => (
                    <span key={badge} className="rounded-full bg-dama-green-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-lg">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <p className="font-noto-kr text-xs text-dama-charcoal/40">{set.nameKo}</p>
                <h3 className="text-lg font-bold text-dama-charcoal">{set.nameEn}</h3>
                <p className="mt-0.5 text-xs font-medium text-dama-green-600">{set.subtitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-dama-charcoal/60 line-clamp-2">{set.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-dama-green-600">{formatPrice(set.price)}</span>
                    {set.upgradePrice && (
                      <span className="ml-2 text-xs font-medium text-amber-600">Galbi +${set.upgradePrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-dama-charcoal/60">New items every week — our menu rotates based on seasonal ingredients.</p>
          <Link href="/menu" className="mt-4 inline-block">
            <Button>Order Now</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
