import type { MenuItem } from '@/types/menu';
import type { CubeSize, GridCell, PlacedCube, TrayConfig } from '@/types/tray';
import { TRAY_CONFIGS } from '@/types/tray';

export function createEmptyCells(traySize: number): GridCell[] {
  return Array.from({ length: traySize }, (_, i) => ({
    index: i,
    occupiedBy: null,
    isSecondary: false,
  }));
}

export function getConfig(traySize: number): TrayConfig {
  return TRAY_CONFIGS.find((c) => c.size === traySize) ?? TRAY_CONFIGS[0];
}

export function canPlaceCube(
  cells: GridCell[],
  cellIndex: number,
  cubeSize: CubeSize,
  columns: number,
  excludeInstanceId?: string
): boolean {
  if (cellIndex < 0 || cellIndex >= cells.length) return false;

  const cell = cells[cellIndex];
  const cellFree =
    cell.occupiedBy === null || cell.occupiedBy === excludeInstanceId;
  if (!cellFree) return false;

  if (cubeSize === 1) return true;

  // Double cube: must not be in last column of its row
  const col = cellIndex % columns;
  if (col >= columns - 1) return false;

  const adjacent = cells[cellIndex + 1];
  if (!adjacent) return false;

  const adjacentFree =
    adjacent.occupiedBy === null || adjacent.occupiedBy === excludeInstanceId;
  return adjacentFree;
}

export function placeCube(
  cells: GridCell[],
  cube: PlacedCube
): GridCell[] {
  const next = cells.map((c) => ({ ...c }));
  next[cube.cellIndex] = {
    ...next[cube.cellIndex],
    occupiedBy: cube.instanceId,
    isSecondary: false,
  };
  if (cube.cubeSize === 2) {
    next[cube.cellIndex + 1] = {
      ...next[cube.cellIndex + 1],
      occupiedBy: cube.instanceId,
      isSecondary: true,
    };
  }
  return next;
}

export function removeCube(
  cells: GridCell[],
  instanceId: string
): GridCell[] {
  return cells.map((c) =>
    c.occupiedBy === instanceId
      ? { ...c, occupiedBy: null, isSecondary: false }
      : c
  );
}

export function computeTotalPrice(
  cubes: PlacedCube[],
  menuItemsMap: Map<string, MenuItem>
): number {
  return cubes.reduce((sum, cube) => {
    const item = menuItemsMap.get(cube.menuItemId);
    if (!item) return sum;
    return sum + item.price * cube.cubeSize;
  }, 0);
}

export function validateTray(cells: GridCell[]): {
  isFull: boolean;
  emptyCount: number;
} {
  const emptyCount = cells.filter((c) => c.occupiedBy === null).length;
  return { isFull: emptyCount === 0, emptyCount };
}

export function suggestFillers(
  cells: GridCell[],
  columns: number,
  banchanItems: MenuItem[]
): { singles: MenuItem[]; doubles: MenuItem[] } {
  const emptyCells = cells.filter((c) => c.occupiedBy === null);
  if (emptyCells.length === 0) return { singles: [], doubles: [] };

  const sorted = [...banchanItems]
    .filter((i) => i.available && !i.soldOut)
    .sort((a, b) => a.price - b.price);

  // Check if any double placements are possible
  let canFitDouble = false;
  for (const cell of emptyCells) {
    const col = cell.index % columns;
    if (col < columns - 1) {
      const adjacent = cells[cell.index + 1];
      if (adjacent && adjacent.occupiedBy === null) {
        canFitDouble = true;
        break;
      }
    }
  }

  return {
    singles: sorted.slice(0, 3),
    doubles: canFitDouble ? sorted.slice(0, 3) : [],
  };
}

export function encodeTrayConfig(
  traySize: number,
  cubes: PlacedCube[],
  cells: GridCell[],
  menuItemsMap: Map<string, MenuItem>
): string {
  // Build letter mapping: each unique menu item gets a letter
  const itemLetters = new Map<string, string>();
  let letterIdx = 0;
  for (const cube of cubes) {
    if (!itemLetters.has(cube.menuItemId)) {
      itemLetters.set(
        cube.menuItemId,
        String.fromCharCode(65 + letterIdx++)
      );
    }
  }

  let code = '';
  for (const cell of cells) {
    if (cell.occupiedBy === null) {
      code += '__';
    } else {
      const cube = cubes.find((c) => c.instanceId === cell.occupiedBy);
      if (!cube) {
        code += '__';
        continue;
      }
      const letter = itemLetters.get(cube.menuItemId) ?? '?';
      if (cell.isSecondary) {
        code += `${letter}0`;
      } else if (cube.cubeSize === 2) {
        code += `${letter}2`;
      } else {
        code += `${letter}1`;
      }
    }
  }

  return `${traySize}-${code}`;
}

export function buildTrayCartItems(
  cubes: PlacedCube[],
  menuItemsMap: Map<string, MenuItem>
): { menuItem: MenuItem; quantity: number }[] {
  const counts = new Map<string, number>();
  for (const cube of cubes) {
    counts.set(cube.menuItemId, (counts.get(cube.menuItemId) ?? 0) + cube.cubeSize);
  }

  const items: { menuItem: MenuItem; quantity: number }[] = [];
  for (const [itemId, qty] of counts) {
    const menuItem = menuItemsMap.get(itemId);
    if (menuItem) {
      items.push({ menuItem, quantity: qty });
    }
  }
  return items;
}

let instanceCounter = 0;
export function generateInstanceId(): string {
  return `cube-${Date.now()}-${++instanceCounter}`;
}

// Deterministic color palette for placed cubes (bg, border, text)
const CUBE_COLORS = [
  { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-800', dot: 'bg-rose-500' },
  { bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-800', dot: 'bg-sky-500' },
  { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-800', dot: 'bg-violet-500' },
  { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', dot: 'bg-orange-500' },
  { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-800', dot: 'bg-teal-500' },
  { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-800', dot: 'bg-pink-500' },
  { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  { bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-800', dot: 'bg-lime-500' },
] as const;

export type CubeColor = (typeof CUBE_COLORS)[number];

export function getCubeColor(menuItemId: string, allItemIds: string[]): CubeColor {
  const idx = allItemIds.indexOf(menuItemId);
  return CUBE_COLORS[(idx >= 0 ? idx : 0) % CUBE_COLORS.length];
}
