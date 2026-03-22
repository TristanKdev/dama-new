'use client';

import { cn } from '@/lib/utils';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { isDeliveryDay, isSameDay, toDateString } from '@/lib/utils';

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  className?: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthData(monthOffset: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const dates: (Date | null)[] = [];
  // Pad before first day
  for (let i = 0; i < startPadding; i++) {
    dates.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(new Date(year, month, d));
  }
  // Pad after last day to fill final row
  while (dates.length % 7 !== 0) {
    dates.push(null);
  }

  return { dates, firstDay, lastDay };
}

export function Calendar({ selectedDate, onDateSelect, className }: CalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = useMemo(() => new Date(), []);
  const [availableDates, setAvailableDates] = useState<Set<string> | null>(null);

  // Fetch available delivery dates from the API (respects DB schedule + blackouts)
  useEffect(() => {
    fetch('/api/delivery-dates')
      .then(r => r.json())
      .then(data => {
        if (data.dates?.length > 0) {
          const available = new Set<string>(
            data.dates
              .filter((d: { available: boolean }) => d.available)
              .map((d: { date: string }) => d.date)
          );
          setAvailableDates(available);
        }
      })
      .catch(() => {
        // On failure, leave null — will fall back to hardcoded isDeliveryDay
      });
  }, []);

  // Max date is today + 28 days
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 28);
    return d;
  }, [today]);

  const { dates, firstDay } = useMemo(() => getMonthData(monthOffset), [monthOffset]);

  const monthLabel = useMemo(
    () =>
      firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [firstDay]
  );

  // Don't allow going to months that are fully before today
  const canGoPrev = monthOffset > 0;
  // Don't allow going to months that are fully beyond maxDate
  const canGoNext = useMemo(() => {
    const nextMonthFirst = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 1);
    return nextMonthFirst <= maxDate;
  }, [monthOffset, today, maxDate]);

  const handlePrev = useCallback(() => {
    if (canGoPrev) setMonthOffset((m) => m - 1);
  }, [canGoPrev]);

  const handleNext = useCallback(() => {
    if (canGoNext) setMonthOffset((m) => m + 1);
  }, [canGoNext]);

  return (
    <div className={cn('w-full', className)}>
      {/* Month/year header with arrows */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-dama-sand/50 disabled:opacity-30"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 4l-4 4 4 4" />
          </svg>
        </button>
        <span className="text-sm font-medium text-dama-charcoal">{monthLabel}</span>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-dama-sand/50 disabled:opacity-30"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-xs font-medium text-dama-charcoal/50">
            {label}
          </div>
        ))}

        {/* Date cells */}
        {dates.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

          const dateStr = toDateString(date);
          const isToday = isSameDay(date, today);
          // Use API dates if loaded, otherwise fall back to hardcoded days
          const isDelivery = availableDates
            ? availableDates.has(dateStr)
            : isDeliveryDay(date);
          const isPast = date < today && !isToday;
          const isBeyondMax = date > maxDate;
          const isSelected = selectedDate === dateStr;
          // When using API dates, availability already accounts for past/cutoff
          const isSelectable = availableDates
            ? availableDates.has(dateStr)
            : (isDelivery && !isPast && !isBeyondMax);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => isSelectable && onDateSelect(dateStr)}
              disabled={!isSelectable}
              className={cn(
                'relative flex h-10 flex-col items-center justify-center rounded-md text-sm transition-colors',
                isSelectable && 'cursor-pointer hover:bg-dama-green-50',
                isSelected && 'bg-dama-green-500 text-white hover:bg-dama-green-600',
                !isSelectable && 'cursor-default text-dama-charcoal/25',
                !isSelected && isSelectable && 'text-dama-charcoal',
              )}
              aria-label={`${isDelivery ? 'Delivery available' : 'No delivery'} ${date.toLocaleDateString()}`}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-dama-green-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
