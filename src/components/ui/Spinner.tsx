// src/components/ui/Spinner.tsx

import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = { sm: 16, md: 24, lg: 36 };

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-2', className)}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      <Loader2
        size={sizeMap[size]}
        className="animate-spin text-brand-500"
      />
      {label && (
        <span className="text-base text-text-muted">{label}</span>
      )}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size="lg" label="Loading..." />
    </div>
  );
}