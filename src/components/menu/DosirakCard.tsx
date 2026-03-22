'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import type { MenuItem } from '@/types/menu';

interface DosirakCardProps {
  item: MenuItem;
}

export function DosirakCard({ item }: DosirakCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  function handleAdd() {
    addItem(item);
    openCart();
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-dama-sand/50 bg-white transition-shadow hover:shadow-lg">
      {item.soldOut && (
        <div className="rounded-t-xl bg-dama-charcoal/10 px-4 py-1.5 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-dama-charcoal/60">Sold Out</span>
        </div>
      )}
      {/* Badges */}
      {item.badges && item.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-4">
          {item.badges.map(badge => (
            <span key={badge} className="rounded-full bg-dama-green-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-dama-charcoal/50">{item.nameKo}</p>
            <h3 className="text-lg font-semibold text-dama-charcoal">{item.nameEn}</h3>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl font-bold text-dama-green-600">{formatPrice(item.price)}</span>
            {item.upgradePrice && (
              <p className="text-xs font-medium text-amber-600">Galbi upgrade +${item.upgradePrice}</p>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-dama-charcoal/60">
          {item.description}
        </p>

        {/* Set Contents */}
        {item.setContents && item.setContents.length > 0 && (
          <div className="mt-3 rounded-lg bg-dama-cream/60 p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-dama-charcoal/50">What&apos;s Inside</p>
            <ul className="space-y-0.5">
              {item.setContents.map((content, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-dama-charcoal/70">
                  <span className="mt-0.5 text-dama-green-500">&#8226;</span>
                  {content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dietary tags */}
        {item.dietaryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.dietaryTags.map(tag => <Badge key={tag} tag={tag} />)}
          </div>
        )}

        <div className="mt-4">
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
