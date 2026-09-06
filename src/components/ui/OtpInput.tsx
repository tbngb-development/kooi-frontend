"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isPasting, setIsPasting] = useState(false);

  const digits = value.padEnd(length, "").split("").slice(0, length);

  const focusInput = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1));
      inputRefs.current[clamped]?.focus();
    },
    [length],
  );

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => focusInput(0), 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled, focusInput]);

  const updateValue = useCallback(
    (newDigits: string[]) => {
      const joined = newDigits.join("").replace(/\s/g, "");
      onChange(joined);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        const newDigits = [...digits];
        if (newDigits[index]) {
          newDigits[index] = "";
          updateValue(newDigits);
        } else if (index > 0) {
          newDigits[index - 1] = "";
          updateValue(newDigits);
          focusInput(index - 1);
        }
        return;
      }

      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
        return;
      }

      if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        focusInput(index + 1);
        return;
      }
    },
    [digits, disabled, focusInput, length, updateValue],
  );

  const handleInput = useCallback(
    (index: number, e: React.FormEvent<HTMLInputElement>) => {
      if (disabled || isPasting) return;

      const target = e.target as HTMLInputElement;
      const char = target.value.slice(-1);

      if (!/^\d$/.test(char)) {
        target.value = "";
        return;
      }

      const newDigits = [...digits];
      newDigits[index] = char;
      updateValue(newDigits);

      if (index < length - 1) {
        focusInput(index + 1);
      }
    },
    [digits, disabled, focusInput, isPasting, length, updateValue],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      if (disabled) return;

      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);

      if (!pasted) return;

      setIsPasting(true);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      updateValue(newDigits);

      const nextEmpty = newDigits.findIndex((d) => !d);
      focusInput(nextEmpty === -1 ? length - 1 : nextEmpty);

      requestAnimationFrame(() => setIsPasting(false));
    },
    [digits, disabled, focusInput, length, updateValue],
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digits[i] ?? ""}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            onInput={(e) => handleInput(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            onFocus={handleFocus}
            className={cn(
              "h-12 w-11 sm:h-14 sm:w-12 rounded-lg border text-center text-xl font-semibold",
              "text-text-primary bg-surface transition-all outline-none",
              "placeholder:text-text-placeholder",
              "focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-error-400 focus:border-error-500 focus:ring-error-500/30"
                : "border-surface-border",
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-error-600 text-center mt-1">{error}</p>
      )}
    </div>
  );
}
