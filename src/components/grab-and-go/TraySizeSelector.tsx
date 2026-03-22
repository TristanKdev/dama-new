'use client';

import { TRAY_CONFIGS, type TraySize } from '@/types/tray';

interface TraySizeSelectorProps {
  selected: TraySize | null;
  onSelect: (size: TraySize) => void;
}

export function TraySizeSelector({ selected, onSelect }: TraySizeSelectorProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="font-cormorant text-xl font-semibold text-dama-charcoal">
          Step 1: Choose your tray size
        </h2>
        <p className="mt-1 text-sm text-dama-charcoal/60">
          Pick a size, then drag banchan cubes into the grid.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {TRAY_CONFIGS.map((config) => {
          const isSelected = selected === config.size;
          return (
            <button
              key={config.size}
              onClick={() => onSelect(config.size)}
              className={`group flex flex-col items-center rounded-2xl border-2 px-8 py-5 transition-all ${
                isSelected
                  ? 'border-dama-green-500 bg-dama-green-50 shadow-lg ring-2 ring-dama-green-500/20'
                  : 'border-dama-sand bg-white shadow-sm hover:border-dama-green-400 hover:shadow-md'
              }`}
            >
              {/* Mini grid preview */}
              <div
                className="mb-3 grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
                }}
              >
                {Array.from({ length: config.size }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 w-4 rounded transition-colors ${
                      isSelected
                        ? 'bg-dama-green-500'
                        : 'bg-dama-sand group-hover:bg-dama-green-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-base font-semibold text-dama-charcoal">
                {config.label}
              </span>
              <span className="mt-0.5 text-xs text-dama-charcoal/60">
                {config.columns} &times; {config.rows} grid
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
