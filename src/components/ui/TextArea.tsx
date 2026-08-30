// src/components/ui/TextArea.tsx

import { cn } from '@/lib/utils/cn';
import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-base font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-placeholder',
            'transition-colors duration-150 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error
              ? 'border-error-500 focus:ring-error-500'
              : 'border-surface-border hover:border-text-placeholder',
            className
          )}
          {...props}
        />
        {error && <p className="text-base text-error-500">{error}</p>}
        {hint && !error && (
          <p className="text-base text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';