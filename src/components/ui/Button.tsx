// src/components/ui/Button.tsx

import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-text-inverse hover:bg-brand-500 active:bg-brand-600 shadow-xs',
  secondary:
    'bg-brand-100 text-brand-600 hover:bg-brand-300/30 active:bg-brand-100',
  outline:
    'border border-surface-border bg-surface text-text-secondary hover:bg-surface-hover active:bg-surface-subtle',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-hover active:bg-surface-subtle',
  danger:
    'bg-error-600 text-text-inverse hover:bg-error-500 active:bg-error-600 shadow-xs',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-base gap-1.5',
  md: 'h-9 px-4 text-base gap-2',
  lg: 'h-11 px-6 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus-ring cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={14} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}