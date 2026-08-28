"use client";

import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm", // 384px
  md: "max-w-md", // 448px
  lg: "max-w-lg", // 512px
  xl: "max-w-2xl", // 672px
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  // Lock body scroll when open
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

  // Accessibility: Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          // Box Model & Flex alignment
          "relative w-full bg-surface shadow-2xl border border-surface-border",
          "flex flex-col rounded-xl overflow-hidden",
          // 📱 Responsive Height Constraints (Ensures tall modals don't clip off the screen)
          "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)]",
          "animate-[scaleIn_0.15s_ease-out]",
          sizeClasses[size],
          className,
        )}
      >
        {/* Header - Fixed at top */}
        {title && (
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4 shrink-0">
            <h2 className="text-base sm:text-lg font-semibold text-text-primary truncate pr-4">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* 📜 Scrollable Content container */}
        <div className="p-5 overflow-y-auto min-h-0 flex-1 text-sm sm:text-base text-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}
