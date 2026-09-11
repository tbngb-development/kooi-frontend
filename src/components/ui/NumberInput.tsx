"use client";

import { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NumberInputProps {
  value: number | string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string; // Step amount for + / - buttons
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  placeholder,
  step,
  min = 0,
  max,
  disabled,
  className,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stepValue = parseFloat(step ?? "1") || 1;

  const clampValue = (val: number): number => {
    if (min !== undefined && val < min) return min;
    if (max !== undefined && val > max) return max;
    return val;
  };

  const formatValue = (val: number): string => {
    const decimals = (String(stepValue).split(".")[1] ?? "").length;
    return decimals > 0 ? val.toFixed(decimals) : String(val);
  };

  // + / - buttons use the `step` prop value
  const handleStep = (direction: "increment" | "decrement") => {
    if (disabled) return;

    const current = parseFloat(String(value)) || 0;
    const raw =
      direction === "increment" ? current + stepValue : current - stepValue;

    const clamped = clampValue(raw);
    onChange(formatValue(clamped));
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const num = parseFloat(String(value));

    if (isNaN(num)) {
      onChange(formatValue(min ?? 0));
      return;
    }

    const clamped = clampValue(num);
    if (clamped !== num) {
      onChange(formatValue(clamped));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const currentValue = parseFloat(String(value)) || 0;
  const isMinReached = min !== undefined && currentValue <= min;
  const isMaxReached = max !== undefined && currentValue >= max;

  return (
    <div
      className={cn(
        "flex items-center w-full max-w-xs rounded-lg border bg-surface transition-all overflow-hidden",
        disabled
          ? "border-surface-border opacity-50 cursor-not-allowed"
          : "border-surface-border focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:ring-offset-1",
        className,
      )}
    >
      {/* Minus button */}
      <button
        type="button"
        tabIndex={-1}
        onClick={() => handleStep("decrement")}
        disabled={disabled || isMinReached}
        className={cn(
          "flex items-center justify-center w-10 h-9 shrink-0 transition-colors select-none",
          disabled || isMinReached
            ? "text-text-placeholder/40 bg-surface-disabled cursor-not-allowed"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle active:bg-surface-active cursor-pointer",
        )}
        aria-label="Decrease value"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>

      <div className="w-px h-5 bg-surface-border shrink-0" />

      {/* Input element - step="any" allows typing any number freely */}
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        step="any" // ✅ Set to "any" so browser native validation doesn't block custom numbers
        min={min}
        max={max}
        disabled={disabled}
        className="
          flex-1 min-w-0 px-3 py-1.5 text-sm font-semibold text-center
          text-text-primary placeholder:text-text-placeholder
          bg-transparent outline-none border-0 ring-0
          disabled:cursor-not-allowed
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
      />

      <div className="w-px h-5 bg-surface-border shrink-0" />

      {/* Plus button */}
      <button
        type="button"
        tabIndex={-1}
        onClick={() => handleStep("increment")}
        disabled={disabled || isMaxReached}
        className={cn(
          "flex items-center justify-center w-10 h-9 shrink-0 transition-colors select-none",
          disabled || isMaxReached
            ? "text-text-placeholder/40 bg-surface-disabled cursor-not-allowed"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle active:bg-surface-active cursor-pointer",
        )}
        aria-label="Increase value"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
