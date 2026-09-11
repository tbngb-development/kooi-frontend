"use client";

import { cn } from "@/lib/utils/cn";
import { ArrowDownUp, RotateCcw, X, ChevronDown } from "lucide-react";

// ─── FilterBar (wrapper) ──────────────────────────────────────────────────────

interface FilterBarProps {
  children: React.ReactNode;
  hasActiveFilters?: boolean;
  onReset?: () => void;
  className?: string;
}

export function FilterBar({
  children,
  hasActiveFilters = false,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2.5 rounded-xl border border-surface-border bg-surface p-3 shadow-xs",
        className,
      )}
    >
      {children}

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-error-600 hover:bg-error-50 hover:text-error-700 transition-colors border border-transparent hover:border-error-100 focus-ring"
        >
          <RotateCcw size={14} />
          Reset All
        </button>
      )}
    </div>
  );
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
  allowAll?: boolean;
  allLabel?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
  allowAll = true,
  allLabel = "All",
}: FilterSelectProps) {
  const hasValue = value !== "";

  return (
    <div className={cn("relative flex items-center", className)}>
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-lg border pl-3.5 pr-9 py-2 text-sm font-semibold transition-all cursor-pointer min-w-[130px]",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400",
          hasValue
            ? "border-brand-300 text-brand-700 bg-brand-50 shadow-xs"
            : "border-surface-border text-text-secondary bg-surface hover:border-neutral-300 hover:bg-surface-hover",
        )}
      >
        {allowAll && (
          <option value="">
            {allLabel} {label}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasValue ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange("");
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-600 hover:bg-brand-100 hover:text-brand-700 transition-colors z-10"
          aria-label={`Clear ${label}`}
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      ) : (
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
      )}
    </div>
  );
}

// ─── SortSelect ───────────────────────────────────────────────────────────────

interface SortSelectProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  options: FilterOption[];
  className?: string;
}

export function SortSelect({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  options,
  className,
}: SortSelectProps) {
  const toggleOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className={cn(
            "appearance-none rounded-lg border border-surface-border bg-surface",
            "pl-3.5 pr-9 py-2 text-sm font-semibold text-text-secondary cursor-pointer",
            "hover:border-neutral-300 hover:bg-surface-hover transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400",
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>

      <button
        type="button"
        onClick={toggleOrder}
        title={sortOrder === "asc" ? "Ascending order" : "Descending order"}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-surface",
          "text-text-muted hover:bg-surface-hover hover:text-text-primary hover:border-neutral-300 transition-colors focus-ring",
        )}
      >
        <ArrowDownUp
          size={14}
          className={cn(
            "transition-transform duration-normal ease-out",
            sortOrder === "asc" && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}
