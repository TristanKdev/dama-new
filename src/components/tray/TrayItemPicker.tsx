'use client';

import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/types/menu';

interface TrayItemPickerProps {
  menuItems: MenuItem[];
  selectedItem: MenuItem | null;
  isDouble: boolean;
  onSelectItem: (item: MenuItem) => void;
  onToggleDouble: () => void;
}

export function TrayItemPicker({
  menuItems,
  selectedItem,
  isDouble,
  onSelectItem,
  onToggleDouble,
}: TrayItemPickerProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
        Select an Item
      </h3>

      {/* Double toggle */}
      {selectedItem && (
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={isDouble}
            onClick={onToggleDouble}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              isDouble ? 'bg-dama-green-500' : 'bg-dama-sand'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                isDouble && 'translate-x-4'
              )}
            />
          </button>
          <span className="text-xs text-dama-charcoal/60">
            Double portion (2 slots)
          </span>
        </div>
      )}

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {menuItems.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const isSoldOut = item.soldOut;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !isSoldOut && onSelectItem(item)}
              disabled={isSoldOut}
              className={cn(
                'w-full rounded-md border p-3 text-left transition-colors',
                isSelected && 'border-dama-green-400 bg-dama-green-50',
                !isSelected && !isSoldOut && 'border-dama-sand bg-white hover:border-dama-green-200',
                isSoldOut && 'cursor-not-allowed border-dama-sand/50 bg-dama-ivory/50 opacity-50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dama-charcoal">{item.nameEn}</p>
                  <p className="text-xs text-dama-charcoal/50">{item.nameKo}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-dama-green-600">
                  {isSoldOut ? 'Sold Out' : formatPrice(item.price)}
                </span>
              </div>
              {item.badges && item.badges.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {item.badges.map(b => (
                    <span key={b} className="rounded-full bg-dama-green-50 px-1 py-0.5 text-[8px] font-medium text-dama-green-700">{b}</span>
                  ))}
                </div>
              )}
              {item.flavorProfile && (
                <p className="mt-1.5 text-[10px] leading-snug text-dama-charcoal/50"><span className="font-semibold text-dama-green-600">Flavor:</span> {item.flavorProfile}</p>
              )}
              {item.texture && (
                <p className="mt-0.5 text-[10px] leading-snug text-dama-charcoal/50"><span className="font-semibold text-dama-green-600">Texture:</span> {item.texture}</p>
              )}
              {item.pairsWellWith && (
                <p className="mt-0.5 text-[10px] leading-snug text-dama-charcoal/50"><span className="font-semibold text-dama-green-600">Pairs with:</span> {item.pairsWellWith}</p>
              )}
              {item.chefsNote && (
                <p className="mt-0.5 text-[10px] leading-snug text-dama-charcoal/50"><span className="font-semibold text-dama-green-600">Chef:</span> {item.chefsNote}</p>
              )}
              {item.review && (
                <p className="mt-1 text-[10px] italic leading-snug text-dama-charcoal/40">&ldquo;{item.review}&rdquo;</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
