// src/components/ui/Drawer.tsx

"use client";

import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Custom footer node; sticks to bottom of drawer */
  footer?: ReactNode;
  /** Prevent close on backdrop click (e.g. during a critical operation) */
  disableBackdropClose?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<DrawerProps["size"]>, string> = {
  sm: "max-w-sm", // 384px
  md: "max-w-md", // 448px
  lg: "max-w-xl", // 576px
  xl: "max-w-2xl", // 672px
  "2xl": "max-w-3xl", // 768px
};

/**
 * Right-side slide-in drawer. Portal-based, keyboard accessible, scroll-locked.
 * Composed of: backdrop → panel (header + scrollable body + optional sticky footer).
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  disableBackdropClose = false,
  className,
}: DrawerProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "drawer-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={disableBackdropClose ? undefined : onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full bg-surface shadow-2xl border-l border-surface-border",
          "flex flex-col h-full animate-[slideInRight_0.25s_ease-out]",
          SIZE_CLASSES[size],
          className,
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-surface-border px-6 py-4 shrink-0 bg-surface">
            <div className="min-w-0">
              {title && (
                <h2
                  id="drawer-title"
                  className="text-base sm:text-lg font-bold text-text-primary truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-text-muted mt-0.5">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Close drawer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto thin-scrollbar px-6 py-5">
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="border-t border-surface-border px-6 py-4 bg-surface shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
