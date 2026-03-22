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
                'flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors',
                isSelected && 'border-dama-green-400 bg-dama-green-50',
                !isSelected && !isSoldOut && 'border-dama-sand bg-white hover:border-dama-green-200',
                isSoldOut && 'cursor-not-allowed border-dama-sand/50 bg-dama-ivory/50 opacity-50',
              )}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-dama-charcoal">{item.nameEn}</p>
                <p className="text-xs text-dama-charcoal/50">{item.nameKo}</p>
              </div>
              <span className="text-sm font-semibold text-dama-green-600">
                {isSoldOut ? 'Sold Out' : formatPrice(item.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
