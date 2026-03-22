'use client';

import type { MenuItem } from '@/types/menu';

interface FillerSuggestionsProps {
  emptyCount: number;
  singles: MenuItem[];
  doubles: MenuItem[];
}

export function FillerSuggestions({
  emptyCount,
  singles,
  doubles,
}: FillerSuggestionsProps) {
  if (emptyCount === 0) return null;

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-dama-green-200 bg-dama-green-50/60 p-4">
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-dama-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-dama-green-800">
            Need to fill {emptyCount} more {emptyCount === 1 ? 'slot' : 'slots'}
          </h4>
          <p className="mt-0.5 text-xs text-dama-green-700">
            Most affordable options to complete your tray:
          </p>
          <ul className="mt-2 space-y-1">
            {singles.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-dama-charcoal/80">{item.nameEn}</span>
                <span className="text-xs font-medium text-dama-charcoal/60">
                  ${item.price.toFixed(2)}/slot
                </span>
              </li>
            ))}
          </ul>
          {doubles.length > 0 && emptyCount >= 2 && (
            <p className="mt-2 text-xs text-dama-green-600">
              Switch to Double mode to fill 2 slots at once.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
