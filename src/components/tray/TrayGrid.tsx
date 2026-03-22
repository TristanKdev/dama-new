'use client';

import { cn } from '@/lib/utils';
import type { TraySlot, TraySize } from '@/types/tray';
import type { MenuItem } from '@/types/menu';

interface TrayGridProps {
  slots: TraySlot[];
  traySize: TraySize;
  columns: number;
  selectedItem: MenuItem | null;
  isDouble: boolean;
  onSlotClick: (index: number) => void;
}

export function TrayGrid({ slots, traySize, columns, selectedItem, isDouble, onSlotClick }: TrayGridProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
        Your Tray ({slots.filter((s) => s.menuItem !== null || s.isDoubleSecond).length}/{traySize} slots filled)
      </h3>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {slots.map((slot) => {
          // Skip rendering the second cell of a double item (it's merged via col-span-2)
          if (slot.isDoubleSecond) return null;

          const isFilled = slot.menuItem !== null;
          const canPlace = !isFilled && selectedItem !== null;
          const canPlaceDouble =
            isDouble &&
            selectedItem &&
            !isFilled &&
            slot.index % columns < columns - 1 &&
            slot.index + 1 < slots.length &&
            !slots[slot.index + 1].menuItem &&
            !slots[slot.index + 1].isDoubleSecond;

          const isClickable = selectedItem
            ? isDouble
              ? canPlaceDouble
              : canPlace
            : isFilled;

          return (
            <button
              key={slot.index}
              type="button"
              onClick={() => isClickable && onSlotClick(slot.index)}
              className={cn(
                'flex min-h-[80px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-2 text-center transition-all',
                slot.isDouble && 'col-span-2',
                isFilled && 'border-solid border-dama-green-300 bg-dama-green-50',
                !isFilled && !selectedItem && 'border-dama-sand/50 bg-dama-ivory/50',
                !isFilled && selectedItem && !isDouble && 'cursor-pointer border-dama-green-200 bg-white hover:border-dama-green-400 hover:bg-dama-green-50',
                !isFilled && isDouble && canPlaceDouble && 'cursor-pointer border-dama-green-200 bg-white hover:border-dama-green-400 hover:bg-dama-green-50',
                !isFilled && isDouble && !canPlaceDouble && 'border-dama-sand/30 bg-dama-ivory/30 opacity-50',
                isFilled && 'cursor-pointer hover:border-dama-error/50 hover:bg-red-50',
              )}
              aria-label={
                isFilled
                  ? `Remove ${slot.menuItem!.nameEn} from slot ${slot.index + 1}`
                  : `Place item in slot ${slot.index + 1}`
              }
            >
              {isFilled ? (
                <>
                  <span className="text-xs font-medium text-dama-charcoal line-clamp-2">
                    {slot.menuItem!.nameEn}
                  </span>
                  <span className="mt-0.5 text-[10px] text-dama-charcoal/50">
                    click to remove
                  </span>
                </>
              ) : (
                <span className="text-xs text-dama-charcoal/50">
                  {selectedItem ? (isDouble && !canPlaceDouble ? '' : '+') : `Slot ${slot.index + 1}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
