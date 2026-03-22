'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import type { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  function handleAdd() {
    addItem(item);
    openCart();
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-dama-sand/50 bg-white transition-shadow hover:shadow-md">
      {/* Image from Square */}
      {item.imageUrl && (
        <div className="relative aspect-square w-full overflow-hidden bg-dama-ivory">
          <Image
            src={item.imageUrl}
            alt={item.nameEn}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {item.soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-dama-charcoal/40">
              <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-dama-charcoal">
                Sold Out
              </span>
            </div>
          )}
          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
            <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-red-600 px-1.5 py-0.5">
              {Array.from({ length: item.spiceLevel }).map((_, i) => (
                <svg key={i} className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-1 0-2 .5-2.5 1.5C9 4.5 8 6 8 8c0 3 2 5.5 4 8 2-2.5 4-5 4-8 0-2-1-3.5-1.5-4.5C14 2.5 13 2 12 2z"/></svg>
              ))}
            </div>
          )}
        </div>
      )}
      {!item.imageUrl && item.soldOut && (
        <div className="rounded-t-lg bg-dama-charcoal/10 px-4 py-1.5 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-dama-charcoal/60">Sold Out</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <p className="text-xs text-dama-charcoal/50">{item.nameKo}</p>
            <h3 className="text-base font-semibold text-dama-charcoal">{item.nameEn}</h3>
          </div>
          <span className="shrink-0 text-lg font-semibold text-dama-green-600">
            {formatPrice(item.price)}
          </span>
        </div>

        <p className="mt-1 text-sm leading-relaxed text-dama-charcoal/60 line-clamp-2">
          {item.description}
        </p>

        {item.badges && item.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.badges.map(badge => {
              const isDietary = (item.dietaryTags as string[]).includes(badge);
              if (isDietary) return <Badge key={badge} tag={badge as import('@/types/menu').DietaryTag} />;
              return (
                <span key={badge} className="inline-flex items-center rounded-full bg-dama-green-50 px-2.5 py-0.5 text-xs font-medium text-dama-green-700">
                  {badge}
                </span>
              );
            })}
          </div>
        )}

        {item.note && (
          <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">{item.note}</p>
        )}

        {item.review && (
          <p className="mt-2 text-xs italic text-dama-charcoal/50">&ldquo;{item.review}&rdquo;</p>
        )}

        <div className="mt-auto pt-4">
          <Button
            onClick={handleAdd}
            disabled={item.soldOut || !item.available}
            size="sm"
            fullWidth
          >
            {item.soldOut ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </article>
  );
}
