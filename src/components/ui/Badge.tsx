// src/components/ui/Badge.tsx

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple"
  | "blue"
  | "gray"
  | "orange";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
  animate?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-subtle text-text-secondary",
  gray: "bg-surface-subtle text-text-muted",
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  error: "bg-error-100 text-error-600",
  info: "bg-info-100 text-info-600",
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-info-100 text-info-600",
  orange: "bg-orange-100 text-orange-700 border border-orange-200",
};

const dotClasses: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  gray: "bg-text-placeholder",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
  info: "bg-info-500",
  purple: "bg-purple-500",
  blue: "bg-info-500",
  orange: "bg-orange-500",
};

export function Badge({
  variant = "default",
  children,
  className,
  dot = false,
  animate = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold leading-none",
        variantClasses[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotClasses[variant],
            animate && "animate-pulse",
          )}
        />
      )}
      {children}
    </span>
  );
}
