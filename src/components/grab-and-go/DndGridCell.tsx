'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { GridCell, PlacedCube, DragData } from '@/types/tray';
import type { MenuItem } from '@/types/menu';
import type { CubeColor } from '@/lib/grab-and-go';

interface DndGridCellProps {
  cell: GridCell;
  placedCube: PlacedCube | null;
  menuItem: MenuItem | null;
  columns: number;
  isHovered: boolean;
  isInvalidHover: boolean;
  cubeColor: CubeColor | null;
}

export function DndGridCell({
  cell,
  placedCube,
  menuItem,
  columns,
  isHovered,
  isInvalidHover,
  cubeColor,
}: DndGridCellProps) {
  const isEmpty = cell.occupiedBy === null;
  const isDouble = placedCube?.cubeSize === 2;

  const { setNodeRef: setDropRef } = useDroppable({
    id: `cell-${cell.index}`,
    data: { cellIndex: cell.index } as Record<string, unknown>,
    disabled: cell.isSecondary,
  });

  const dragData: DragData | null =
    placedCube && menuItem
      ? {
          menuItem,
          cubeSize: placedCube.cubeSize,
          sourceType: 'grid',
          instanceId: placedCube.instanceId,
        }
      : null;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `grid-${cell.index}`,
    data: (dragData ?? {}) as Record<string, unknown>,
    disabled: isEmpty,
  });

  // Secondary cells (right half of a double) are visually merged
  if (cell.isSecondary) return null;

  const dragStyle = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.25 : 1 }
    : undefined;

  // Build classes based on state
  let bgClass: string;
  let borderStyle = '';
  if (isInvalidHover) {
    bgClass = 'bg-red-50 border-dama-error/40';
  } else if (isHovered && isEmpty) {
    bgClass = 'bg-dama-green-50/80 border-dama-green-400';
    borderStyle = 'border-dashed';
  } else if (!isEmpty && cubeColor) {
    bgClass = `${cubeColor.bg} ${cubeColor.border}`;
  } else if (!isEmpty) {
    bgClass = 'bg-dama-green-100 border-dama-green-400';
  } else {
    bgClass = 'bg-white/60 border-dama-sand border-dashed';
  }

  return (
    <div
      ref={(node) => {
        setDropRef(node);
        setDragRef(node);
      }}
      {...(isEmpty ? {} : listeners)}
      {...(isEmpty ? {} : attributes)}
      style={dragStyle}
      className={`relative flex min-h-[88px] items-center justify-center rounded-lg border-2 transition-all duration-150 ${bgClass} ${borderStyle} ${
        isDouble ? 'col-span-2' : ''
      } ${!isEmpty ? 'cursor-grab touch-none shadow-sm hover:shadow-md active:cursor-grabbing' : ''}`}
    >
      {isEmpty ? (
        <div className="flex flex-col items-center gap-0.5">
          <svg
            className="h-4 w-4 text-dama-sand"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      ) : menuItem ? (
        <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-center">
          <span className={`text-xs font-semibold leading-tight line-clamp-2 ${cubeColor?.text ?? 'text-dama-charcoal'}`}>
            {menuItem.nameEn}
          </span>
          <span className="text-[10px] text-dama-charcoal/60">
            {isDouble ? '2 slots' : '1 slot'} · ${(menuItem.price * (placedCube?.cubeSize ?? 1)).toFixed(2)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
