// src/components/ui/EmptyState.tsx

import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-base text-text-muted max-w-xs mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}