'use client';

import { Calendar } from '@/components/ui/Calendar';

interface DateSelectorProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  return (
    <div className="rounded-lg border border-dama-sand/50 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal">
        Select Delivery Date
      </h3>
      <Calendar selectedDate={selectedDate} onDateSelect={onDateSelect} />
      {selectedDate && (
        <p className="mt-3 text-center text-xs text-dama-green-600">
          Delivery: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}
