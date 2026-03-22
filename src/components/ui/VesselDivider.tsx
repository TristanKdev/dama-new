import { cn } from '@/lib/utils';

interface VesselDividerProps {
  className?: string;
}

export function VesselDivider({ className }: VesselDividerProps) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <svg
        width={48}
        height={24}
        viewBox="0 0 48 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-dama-sand"
        aria-hidden="true"
      >
        <path d="M8 6 C8 6, 4 6, 4 12 C4 17, 12 20, 24 20 C36 20, 44 17, 44 12 C44 6, 40 6, 40 6" />
        <path d="M8 6 C8 6, 14 4, 24 4 C34 4, 40 6, 40 6" />
      </svg>
    </div>
  );
}
