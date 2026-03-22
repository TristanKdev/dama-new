'use client';

import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  className,
}: QuantitySelectorProps) {
  return (
    <div className={cn('inline-flex items-center border border-dama-sand rounded-md', className)}>
      <button
        type="button"
        onClick={() => onQuantityChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="flex h-9 w-9 items-center justify-center text-dama-charcoal transition-colors hover:bg-dama-sand/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-md"
        aria-label="Decrease quantity"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="7" x2="11" y2="7" />
        </svg>
      </button>
      <span className="flex h-9 w-10 items-center justify-center border-x border-dama-sand text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="flex h-9 w-9 items-center justify-center text-dama-charcoal transition-colors hover:bg-dama-sand/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-r-md"
        aria-label="Increase quantity"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="7" y1="3" x2="7" y2="11" />
          <line x1="3" y1="7" x2="11" y2="7" />
        </svg>
      </button>
    </div>
  );
}
