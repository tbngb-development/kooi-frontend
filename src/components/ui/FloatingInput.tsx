// src/components/ui/FloatingInput.tsx

"use client";

import { forwardRef, useState, InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface FloatingInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, value, onFocus, onBlur, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasValue =
      value !== undefined && value !== null && String(value).length > 0;
    const isFloating = isFocused || hasValue;

    return (
      <div className="w-full">
        <div className="relative">
          {/* Input */}
          <input
            ref={ref}
            value={value ?? ""}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={clsx(
              // base
              "peer w-full rounded-lg border bg-surface text-base text-text-primary",
              "px-3.5 pt-4 pb-2 h-14",
              "focus:outline-none transition-colors",
              "placeholder-transparent",
              // border states
              error
                ? "border-error focus:border-error"
                : isFocused
                  ? "border-primary "
                  : "border-border hover:border-text-muted/50",
              className,
            )}
            placeholder={label}
            {...props}
          />

          {/* Floating label */}
          <label
            className={clsx(
              "absolute left-3.5 pointer-events-none",
              "transition-all duration-150 ease-out",
              "bg-surface px-1",
              isFloating
                ? // Floating position — top of border
                  "top-0 -translate-y-1/2 text-sm"
                : // Resting position — center
                  "top-1/2 -translate-y-1/2 text-base",
              error
                ? "text-error"
                : isFocused
                  ? "text-primary"
                  : "text-text-muted",
            )}
          >
            {label}
          </label>
        </div>

        {error && <p className="mt-1 text-sm text-error px-1">{error}</p>}
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";