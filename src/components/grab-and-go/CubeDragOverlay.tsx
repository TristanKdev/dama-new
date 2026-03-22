'use client';

import type { DragData } from '@/types/tray';
import type { CubeColor } from '@/lib/grab-and-go';

interface CubeDragOverlayProps {
  data: DragData;
  cubeColor: CubeColor;
}

export function CubeDragOverlay({ data, cubeColor }: CubeDragOverlayProps) {
  const { menuItem, cubeSize } = data;

  return (
    <div
      className={`pointer-events-none z-50 flex items-center gap-2.5 rounded-lg border-2 bg-white p-2.5 shadow-2xl ring-2 ring-dama-charcoal/10 ${cubeColor.border} ${
        cubeSize === 2 ? 'min-w-[170px]' : 'min-w-[130px]'
      }`}
    >
      <div
        className={`flex-shrink-0 rounded-md ${cubeColor.bg} ${
          cubeSize === 2 ? 'h-10 w-14' : 'h-10 w-10'
        }`}
      >
        <div className={`flex h-full items-center justify-center text-xs font-bold ${cubeColor.text}`}>
          {cubeSize === 2 ? '2x' : '1x'}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-dama-charcoal">
          {menuItem.nameEn}
        </p>
        <p className="text-xs text-dama-charcoal/60">
          ${(menuItem.price * cubeSize).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
