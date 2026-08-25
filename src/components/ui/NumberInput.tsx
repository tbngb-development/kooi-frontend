"use client";

import { Minus, Plus } from "lucide-react";
import { useRef } from "react";
import clsx from "clsx";

interface NumberInputProps {
  value: number | string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function NumberInput({
  value,
  onChange,
  placeholder,
  step,
  min,
  max,
  disabled = false,
  readOnly = false,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stepValue = parseFloat(step ?? "1") || 1;
  const isLocked = disabled || readOnly;

  const clampValue = (val: number): number => {
    if (min !== undefined && val < min) return min;
    if (max !== undefined && val > max) return max;
    return val;
  };

  const formatValue = (val: number): string => {
    const decimals = (String(stepValue).split(".")[1] ?? "").length;
    return decimals > 0 ? val.toFixed(decimals) : String(val);
  };

  const handleStep = (direction: "increment" | "decrement") => {
    if (isLocked) return;

    const current = parseFloat(String(value)) || 0;
    const raw =
      direction === "increment" ? current + stepValue : current - stepValue;

    const clamped = clampValue(raw);
    onChange(formatValue(clamped));
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;

    const raw = e.target.value;

    if (raw === "" || raw === "-") {
      onChange(raw);
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num)) return;

    onChange(raw);
  };

  const handleBlur = () => {
    if (isLocked) return;

    const num = parseFloat(String(value));

    if (isNaN(num)) {
      onChange(min !== undefined ? formatValue(min) : "");
      return;
    }

    const clamped = clampValue(num);
    if (clamped !== num) {
      onChange(formatValue(clamped));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isLocked) {
      e.target.select();
    }
  };

  const parsedValue = parseFloat(String(value));
  const currentValue = isNaN(parsedValue) ? 0 : parsedValue;

  const isMinReached = min !== undefined && currentValue <= min;
  const isMaxReached = max !== undefined && currentValue >= max;

  return (
    <div
      className={clsx(
        "w-[250px] rounded-xl border overflow-hidden transition-all",
        "flex items-center",
        disabled
          ? "border-surface-border bg-surface-subtle opacity-60 cursor-not-allowed"
          : readOnly
            ? "border-surface-border bg-surface-subtle"
            : "border-surface-border bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-50",
      )}
    >
      {!readOnly && (
        <>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleStep("decrement")}
            disabled={disabled || isMinReached}
            className={clsx(
              "flex h-10 w-10 shrink-0 items-center justify-center transition-colors select-none",
              disabled || isMinReached
                ? "cursor-not-allowed text-text-muted/30"
                : "cursor-pointer text-text-muted hover:bg-surface-subtle hover:text-text-primary active:bg-surface-border",
            )}
            aria-label="Decrease value"
          >
            <Minus size={14} />
          </button>

          <div className="h-5 w-px shrink-0 bg-surface-border" />
        </>
      )}

      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        step={step ?? "any"}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={readOnly}
        aria-readonly={readOnly}
        className={clsx(
          "min-w-0 flex-1 py-2.5 text-base text-center outline-none",
          readOnly
            ? "px-4 bg-surface-subtle cursor-default"
            : "px-3 bg-transparent",
          "text-text-primary placeholder:text-gray-400",
          "disabled:cursor-not-allowed",
          "[appearance:textfield]",
          "[&::-webkit-outer-spin-button]:appearance-none",
          "[&::-webkit-inner-spin-button]:appearance-none",
        )}
      />

      {!readOnly && (
        <>
          <div className="h-5 w-px shrink-0 bg-surface-border" />

          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleStep("increment")}
            disabled={disabled || isMaxReached}
            className={clsx(
              "flex h-10 w-10 shrink-0 items-center justify-center transition-colors select-none",
              disabled || isMaxReached
                ? "cursor-not-allowed text-text-muted/30"
                : "cursor-pointer text-text-muted hover:bg-surface-subtle hover:text-text-primary active:bg-surface-border",
            )}
            aria-label="Increase value"
          >
            <Plus size={14} />
          </button>
        </>
      )}
    </div>
  );
}
