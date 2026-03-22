'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import type { MenuItem } from '@/types/menu';
import type { TraySize, PlacedCube, GridCell, DragData } from '@/types/tray';
import {
  createEmptyCells,
  getConfig,
  canPlaceCube,
  placeCube,
  removeCube,
  computeTotalPrice,
  validateTray,
  suggestFillers,
  buildTrayCartItems,
  generateInstanceId,
  getCubeColor,
} from '@/lib/grab-and-go';
import { useCartStore, type TrayCartItem } from '@/lib/cart-store';

import { TraySizeSelector } from './TraySizeSelector';
import { DndTrayGrid } from './DndTrayGrid';
import { CubePalette } from './CubePalette';
import { CubeDragOverlay } from './CubeDragOverlay';
import { TrayPricingSummary } from './TrayPricingSummary';
import { FillerSuggestions } from './FillerSuggestions';

interface GrabAndGoBuilderProps {
  banchanItems: MenuItem[];
}

export function GrabAndGoBuilder({ banchanItems }: GrabAndGoBuilderProps) {
  const router = useRouter();
  const addTray = useCartStore((s) => s.addTray);
  const openCart = useCartStore((s) => s.openCart);

  const [traySize, setTraySize] = useState<TraySize | null>(null);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [cubes, setCubes] = useState<PlacedCube[]>([]);
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [isHoverValid, setIsHoverValid] = useState(false);

  const menuItemsMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    for (const item of banchanItems) map.set(item.id, item);
    return map;
  }, [banchanItems]);

  const banchanItemIds = useMemo(
    () => banchanItems.map((i) => i.id),
    [banchanItems]
  );

  const config = traySize ? getConfig(traySize) : null;
  const columns = config?.columns ?? 3;

  // Derived state
  const totalPrice = computeTotalPrice(cubes, menuItemsMap);
  const { isFull, emptyCount } = validateTray(cells);
  const filledCount = (traySize ?? 0) - emptyCount;
  const fillers = config
    ? suggestFillers(cells, config.columns, banchanItems)
    : { singles: [], doubles: [] };

  const isDraggingFromGrid = activeDrag?.sourceType === 'grid';

  // --- Sensors ---
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 8 },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  // --- Tray size selection ---
  const handleSelectSize = useCallback((size: TraySize) => {
    setTraySize(size);
    setCells(createEmptyCells(size));
    setCubes([]);
  }, []);

  // --- Drag handlers ---
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (data) setActiveDrag(data);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over || !activeDrag || !config) {
        setHoveredCell(null);
        setIsHoverValid(false);
        return;
      }

      const overData = over.data.current as { cellIndex?: number } | undefined;
      const cellIndex = overData?.cellIndex;
      if (cellIndex === undefined) {
        setHoveredCell(null);
        setIsHoverValid(false);
        return;
      }

      setHoveredCell(cellIndex);
      const excludeId = activeDrag.sourceType === 'grid' ? activeDrag.instanceId : undefined;
      setIsHoverValid(
        canPlaceCube(cells, cellIndex, activeDrag.cubeSize, config.columns, excludeId)
      );
    },
    [activeDrag, cells, config]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over } = event;
      const drag = activeDrag;

      setActiveDrag(null);
      setHoveredCell(null);
      setIsHoverValid(false);

      if (!drag || !config) return;

      // --- Remove from grid (dropped outside or on non-droppable) ---
      if (!over) {
        if (drag.sourceType === 'grid' && drag.instanceId) {
          setCubes((prev) => prev.filter((c) => c.instanceId !== drag.instanceId));
          setCells((prev) => removeCube(prev, drag.instanceId!));
        }
        return;
      }

      const overData = over.data.current as { cellIndex?: number } | undefined;
      const cellIndex = overData?.cellIndex;

      // Dropped on remove zone or invalid target
      if (cellIndex === undefined) {
        if (drag.sourceType === 'grid' && drag.instanceId) {
          setCubes((prev) => prev.filter((c) => c.instanceId !== drag.instanceId));
          setCells((prev) => removeCube(prev, drag.instanceId!));
        }
        return;
      }

      const excludeId = drag.sourceType === 'grid' ? drag.instanceId : undefined;
      if (!canPlaceCube(cells, cellIndex, drag.cubeSize, config.columns, excludeId)) {
        return; // invalid placement — snap back
      }

      if (drag.sourceType === 'grid' && drag.instanceId) {
        // Reposition existing cube
        const existing = cubes.find((c) => c.instanceId === drag.instanceId);
        if (!existing) return;

        const clearedCells = removeCube(cells, drag.instanceId);
        const movedCube: PlacedCube = { ...existing, cellIndex };
        const newCells = placeCube(clearedCells, movedCube);

        setCells(newCells);
        setCubes((prev) =>
          prev.map((c) => (c.instanceId === drag.instanceId ? movedCube : c))
        );
      } else {
        // Place new cube from palette
        const newCube: PlacedCube = {
          instanceId: generateInstanceId(),
          menuItemId: drag.menuItem.id,
          cubeSize: drag.cubeSize,
          cellIndex,
        };

        setCells((prev) => placeCube(prev, newCube));
        setCubes((prev) => [...prev, newCube]);
      }
    },
    [activeDrag, cells, cubes, config]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    setHoveredCell(null);
    setIsHoverValid(false);
  }, []);

  // --- Cart ---
  const handleAddToCart = useCallback(() => {
    if (!traySize || !isFull) return;

    const trayCartItem: TrayCartItem = {
      type: 'tray',
      id: `tray-${Date.now()}`,
      traySize,
      items: buildTrayCartItems(cubes, menuItemsMap),
      totalPrice,
    };

    addTray(trayCartItem);
    openCart();
    router.push('/cart');
  }, [traySize, isFull, cubes, menuItemsMap, totalPrice, addTray, openCart, router]);

  const handleClear = useCallback(() => {
    if (!traySize) return;
    setCells(createEmptyCells(traySize));
    setCubes([]);
  }, [traySize]);

  // --- Render ---
  if (!traySize) {
    return <TraySizeSelector selected={traySize} onSelect={handleSelectSize} />;
  }

  const overlayColor = activeDrag
    ? getCubeColor(activeDrag.menuItem.id, banchanItemIds)
    : null;

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar — palette (desktop: left, mobile: below grid) */}
        <div className="order-2 w-full lg:order-1 lg:w-80 lg:flex-shrink-0">
          <CubePalette
            banchanItems={banchanItems}
            banchanItemIds={banchanItemIds}
          />
        </div>

        {/* Main area — grid + pricing + fillers */}
        <div className="order-1 flex-1 space-y-4 lg:order-2">
          {/* Tray size switcher */}
          <div className="mx-auto flex max-w-xl items-center justify-between">
            <h2 className="font-cormorant text-lg font-semibold text-dama-charcoal">
              {config?.label} ({columns}&times;{config?.rows})
            </h2>
            <button
              onClick={() => {
                setTraySize(null);
                setCells([]);
                setCubes([]);
              }}
              className="text-sm text-dama-green-700 underline hover:text-dama-green-800"
            >
              Change size
            </button>
          </div>

          <DndTrayGrid
            cells={cells}
            cubes={cubes}
            columns={columns}
            menuItemsMap={menuItemsMap}
            banchanItemIds={banchanItemIds}
            hoveredCell={hoveredCell}
            isHoverValid={isHoverValid}
            hoverCubeSize={activeDrag?.cubeSize ?? 1}
            isDraggingFromGrid={isDraggingFromGrid}
          />

          <TrayPricingSummary
            totalPrice={totalPrice}
            filledCount={filledCount}
            totalSlots={traySize}
            isFull={isFull}
            onAddToCart={handleAddToCart}
            onClear={handleClear}
          />

          <FillerSuggestions
            emptyCount={emptyCount}
            singles={fillers.singles}
            doubles={fillers.doubles}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag && overlayColor ? (
          <CubeDragOverlay data={activeDrag} cubeColor={overlayColor} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
