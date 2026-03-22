import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getSquareFeaturedItems } from '@/lib/square-catalog';
import { featuredItems as staticFeaturedItems } from '@/data/menu-items';
import { formatPrice } from '@/lib/utils';

export async function MenuPreview() {
  let items;
  try {
    items = await getSquareFeaturedItems();
    if (items.length === 0) items = staticFeaturedItems.slice(0, 4);
  } catch {
    items = staticFeaturedItems.slice(0, 4);
  }

  return (
    <section className="bg-dama-cream py-16 md:py-24" aria-labelledby="menu-preview-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12">
          <p className="font-noto-kr text-sm text-dama-green-600">이번 주</p>
          <h2 id="menu-preview-heading" className="mt-1 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            This Week&apos;s Highlights
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-xl border border-dama-sand/50 bg-white transition-shadow hover:shadow-lg">
              {item.imageUrl && (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.nameEn}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-noto-kr text-xs text-dama-charcoal/50">{item.nameKo}</p>
                <h3 className="mt-0.5 text-base font-semibold text-dama-charcoal">{item.nameEn}</h3>
                {item.dietaryTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.dietaryTags.slice(0, 2).map(tag => <Badge key={tag} tag={tag} />)}
                  </div>
                )}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-semibold text-dama-green-600">{formatPrice(item.price)}</span>
                  {item.upgradePrice && (
                    <span className="text-xs font-medium text-amber-600">Galbi +${item.upgradePrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-dama-charcoal/60">New items every week — our menu rotates based on seasonal ingredients.</p>
          <Link href="/menu" className="mt-4 inline-block">
            <Button>View Full Menu</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
