"use client";

import { cn } from "@/lib/utils/cn";
import {
  AlertCircle,
  CheckCircle,
  Info,
  LucideProps,
  XCircle,
} from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: string; text: string }
> = {
  info: {
    container: "bg-info-50 border-info-100 text-info-800",
    icon: "text-info-600",
    text: "text-info-700",
  },
  success: {
    container: "bg-success-50 border-success-100 text-success-800",
    icon: "text-success-600",
    text: "text-success-700",
  },
  warning: {
    container: "bg-warning-50 border-warning-100 text-warning-800",
    icon: "text-warning-600",
    text: "text-warning-700",
  },
  error: {
    container: "bg-error-50 border-error-100 text-error-800",
    icon: "text-error-600",
    text: "text-error-700",
  },
};

const icons: Record<AlertVariant, React.ComponentType<LucideProps>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  const Icon = icons[variant];
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-sm leading-relaxed",
        styles.container,
        className,
      )}
    >
      <Icon size={18} className={cn("shrink-0 mt-0.5", styles.icon)} />
      <div className="flex-1 min-w-0 space-y-1">
        {title && <h5 className="font-bold text-text-primary">{title}</h5>}
        <div className={cn("font-medium", styles.text)}>{children}</div>
      </div>
    </div>
  );
}
