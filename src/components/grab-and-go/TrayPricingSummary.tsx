'use client';

interface TrayPricingSummaryProps {
  totalPrice: number;
  filledCount: number;
  totalSlots: number;
  isFull: boolean;
  onAddToCart: () => void;
  onClear: () => void;
}

export function TrayPricingSummary({
  totalPrice,
  filledCount,
  totalSlots,
  isFull,
  onAddToCart,
  onClear,
}: TrayPricingSummaryProps) {
  const emptyCount = totalSlots - filledCount;
  const pct = totalSlots > 0 ? (filledCount / totalSlots) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-dama-sand bg-white p-4 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-dama-charcoal/60 uppercase tracking-wide">
            Tray Total
          </p>
          <p className="text-2xl font-bold text-dama-charcoal">
            ${totalPrice.toFixed(2)}
          </p>
        </div>
        <p className="text-sm font-medium text-dama-charcoal/70">
          {filledCount}/{totalSlots} slots
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-dama-ivory">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFull ? 'bg-dama-success' : 'bg-dama-warning'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {!isFull && emptyCount > 0 && (
        <p className="mt-2 text-sm text-dama-warning">
          {emptyCount} empty {emptyCount === 1 ? 'slot' : 'slots'} remaining
          — fill the tray to add to cart.
        </p>
      )}

      {isFull && (
        <p className="mt-2 text-sm font-medium text-dama-success">
          Tray is full — ready to add to cart!
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={onAddToCart}
          disabled={!isFull}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            isFull
              ? 'bg-dama-green-600 text-white shadow-md hover:bg-dama-green-700 active:scale-[0.98]'
              : 'bg-dama-sand text-dama-charcoal/60 cursor-not-allowed'
          }`}
        >
          {isFull ? 'Add to Cart' : `Fill ${emptyCount} more`}
        </button>
        {filledCount > 0 && (
          <button
            onClick={onClear}
            className="rounded-lg border border-dama-sand px-4 py-2.5 text-sm font-medium text-dama-charcoal/70 transition-colors hover:bg-dama-ivory"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
