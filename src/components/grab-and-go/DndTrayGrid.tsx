'use client';

import type { GridCell, PlacedCube } from '@/types/tray';
import type { MenuItem } from '@/types/menu';
import { getCubeColor } from '@/lib/grab-and-go';
import { DndGridCell } from './DndGridCell';

interface DndTrayGridProps {
  cells: GridCell[];
  cubes: PlacedCube[];
  columns: number;
  menuItemsMap: Map<string, MenuItem>;
  banchanItemIds: string[];
  hoveredCell: number | null;
  isHoverValid: boolean;
  hoverCubeSize: number;
  isDraggingFromGrid: boolean;
}

export function DndTrayGrid({
  cells,
  cubes,
  columns,
  menuItemsMap,
  banchanItemIds,
  hoveredCell,
  isHoverValid,
  hoverCubeSize,
  isDraggingFromGrid,
}: DndTrayGridProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border-2 border-dama-sand bg-dama-ivory p-3 shadow-inner">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {cells.map((cell) => {
            const cube = cell.occupiedBy
              ? cubes.find((c) => c.instanceId === cell.occupiedBy) ?? null
              : null;
            const menuItem = cube
              ? menuItemsMap.get(cube.menuItemId) ?? null
              : null;
            const cubeColor =
              cube && menuItem
                ? getCubeColor(cube.menuItemId, banchanItemIds)
                : null;

            // Determine hover state for this cell
            const isHovered2 =
              hoveredCell !== null &&
              (cell.index === hoveredCell ||
                (hoverCubeSize === 2 && cell.index === hoveredCell + 1));
            const isInvalidHover = isHovered2 && !isHoverValid;

            return (
              <DndGridCell
                key={cell.index}
                cell={cell}
                placedCube={cube}
                menuItem={menuItem}
                columns={columns}
                isHovered={isHovered2 && isHoverValid}
                isInvalidHover={isInvalidHover}
                cubeColor={cubeColor}
              />
            );
          })}
        </div>
      </div>

      {/* Remove zone — visible when dragging from grid */}
      {isDraggingFromGrid && (
        <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-dama-error/40 bg-red-50 p-3 text-sm text-dama-error transition-all">
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Drop here to remove
        </div>
      )}
    </div>
  );
}
