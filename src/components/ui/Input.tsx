import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-dama-charcoal"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={cn(
            'h-12 w-full rounded-md border border-dama-sand bg-white px-4 text-dama-charcoal',
            'placeholder:text-dama-sand transition-colors duration-200',
            'focus:border-dama-green-400 focus:outline-none focus:ring-2 focus:ring-dama-green-400/20',
            error && 'border-dama-error focus:border-dama-error focus:ring-dama-error/20',
            className
          )}
          {...props}
        />
        {error && (
          <p id={id ? `${id}-error` : undefined} className="mt-1 text-sm text-dama-error" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
