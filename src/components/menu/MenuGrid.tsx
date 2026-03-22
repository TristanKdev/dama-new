import { MenuItemCard } from './MenuItemCard';
import type { MenuItem } from '@/types/menu';

interface MenuGridProps {
  items: MenuItem[];
  emptyMessage?: string;
}

export function MenuGrid({ items, emptyMessage = 'No items available for this date.' }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-dama-sand">
          <circle cx="24" cy="24" r="20" />
          <path d="M16 24h16M24 16v16" />
        </svg>
        <p className="text-base font-medium text-dama-charcoal/50">{emptyMessage}</p>
        <p className="mt-1 text-sm text-dama-charcoal/60">Check back soon for updates.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
