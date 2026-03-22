import type { MenuItem } from './menu';

export type TraySize = 4 | 8 | 12;

export interface TraySlot {
  index: number;
  menuItem: MenuItem | null;
  isDouble: boolean;        // true if this is the first cell of a double item
  isDoubleSecond: boolean;  // true if this cell is the second half of a double item
  pairIndex?: number;       // index of the paired slot for double items
}

export interface TrayPlacement {
  menuItem: MenuItem;
  slotIndex: number;
  isDouble: boolean;
}

export interface TrayConfig {
  size: TraySize;
  columns: number;
  rows: number;
  label: string;
  price: string;
}

export const TRAY_CONFIGS: TrayConfig[] = [
  { size: 4, columns: 2, rows: 2, label: 'Pick 4', price: 'Starting at $18' },
  { size: 8, columns: 4, rows: 2, label: 'Pick 8', price: 'Starting at $36' },
  { size: 12, columns: 4, rows: 3, label: 'Pick 12', price: 'Starting at $54' },
];

// --- Grab & Go DnD types ---

export type CubeSize = 1 | 2;

export interface PlacedCube {
  instanceId: string;
  menuItemId: string;
  cubeSize: CubeSize;
  cellIndex: number;
}

export interface GridCell {
  index: number;
  occupiedBy: string | null;
  isSecondary: boolean;
}

export interface DragData {
  menuItem: MenuItem;
  cubeSize: CubeSize;
  sourceType: 'palette' | 'grid';
  instanceId?: string;
}
