import { cn } from '@/lib/utils';
import type { DietaryTag } from '@/types/menu';

interface BadgeProps {
  tag: DietaryTag;
  className?: string;
}

const tagStyles: Record<DietaryTag, string> = {
  'Vegan': 'bg-dama-green-100 text-dama-green-700',
  'Vegetarian': 'bg-dama-green-50 text-dama-green-600',
  'Gluten-Friendly': 'bg-amber-100 text-amber-700',
  'Spicy': 'bg-red-100 text-red-700',
  'Contains Nuts': 'bg-orange-100 text-orange-700',
  'Dairy-Free': 'bg-blue-100 text-blue-700',
};

export function Badge({ tag, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tagStyles[tag],
        className
      )}
    >
      {tag}
    </span>
  );
}
