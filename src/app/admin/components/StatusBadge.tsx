import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  'out-for-delivery': 'bg-orange-100 text-orange-800',
  delivered: 'bg-dama-green-100 text-dama-green-700',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
  refund_pending: 'bg-orange-100 text-orange-800',
  completed: 'bg-dama-green-100 text-dama-green-700',
  failed: 'bg-red-100 text-red-800',
  active: 'bg-dama-green-100 text-dama-green-700',
  paused: 'bg-yellow-100 text-yellow-800',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusColors[status] || 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {label}
    </span>
  );
}
