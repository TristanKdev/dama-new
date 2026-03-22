'use client';

import { useState } from 'react';
import type { MenuItem } from '@/types/menu';
import type { CubeSize } from '@/types/tray';
import { getCubeColor } from '@/lib/grab-and-go';
import { DraggableCube } from './DraggableCube';

interface CubePaletteProps {
  banchanItems: MenuItem[];
  banchanItemIds: string[];
}

export function CubePalette({ banchanItems, banchanItemIds }: CubePaletteProps) {
  const [cubeSize, setCubeSize] = useState<CubeSize>(1);

  const available = banchanItems.filter((i) => i.available && !i.soldOut);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-dama-charcoal">
          Banchan Cubes
        </h3>
        <div className="flex rounded-lg border border-dama-sand bg-white p-0.5">
          <button
            onClick={() => setCubeSize(1)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              cubeSize === 1
                ? 'bg-dama-green-600 text-white shadow-sm'
                : 'text-dama-charcoal/70 hover:bg-dama-ivory'
            }`}
          >
            Single
          </button>
          <button
            onClick={() => setCubeSize(2)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              cubeSize === 2
                ? 'bg-dama-green-600 text-white shadow-sm'
                : 'text-dama-charcoal/70 hover:bg-dama-ivory'
            }`}
          >
            Double
          </button>
        </div>
      </div>

      <p className="text-xs text-dama-charcoal/60">
        {cubeSize === 1
          ? 'Each cube fills 1 slot in the tray.'
          : 'Each cube fills 2 slots horizontally.'}
        {' '}Drag into the grid.
      </p>

      {/* Desktop: vertical scrollable list. Mobile: horizontal scroll strip */}
      <div className="relative">
        <div className="flex gap-2 max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:pb-3 max-lg:[-webkit-overflow-scrolling:touch] lg:flex-col lg:overflow-y-auto lg:max-h-[calc(100vh-220px)] lg:pr-1 lg:pb-6">
          {available.map((item) => (
            <div key={item.id} className="max-lg:snap-start max-lg:flex-shrink-0">
              <DraggableCube
                menuItem={item}
                cubeSize={cubeSize}
                cubeColor={getCubeColor(item.id, banchanItemIds)}
              />
            </div>
          ))}
        </div>
        {/* Scroll fade indicator (desktop only) */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 hidden h-10 bg-gradient-to-t from-dama-cream to-transparent lg:block" />
      </div>
    </div>
  );
}
