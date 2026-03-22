'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { MenuItem } from '@/types/menu';
import type { CubeSize, DragData } from '@/types/tray';
import type { CubeColor } from '@/lib/grab-and-go';

interface DraggableCubeProps {
  menuItem: MenuItem;
  cubeSize: CubeSize;
  cubeColor: CubeColor;
}

export function DraggableCube({ menuItem, cubeSize, cubeColor }: DraggableCubeProps) {
  const dragData: DragData = {
    menuItem,
    cubeSize,
    sourceType: 'palette',
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${menuItem.id}-${cubeSize}`,
      data: dragData as unknown as Record<string, unknown>,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`flex cursor-grab touch-none items-center gap-2.5 rounded-lg border-2 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${cubeColor.border} ${
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
        <p className="truncate text-sm font-medium text-dama-charcoal">
          {menuItem.nameEn}
        </p>
        <p className="text-xs text-dama-charcoal/60">
          ${(menuItem.price * cubeSize).toFixed(2)}
          {cubeSize === 2 && (
            <span className="ml-1 text-dama-charcoal/60">({cubeSize} slots)</span>
          )}
        </p>
      </div>
    </div>
  );
}
