"use client";

import { cn } from "@/lib/utils/cn";
import { ArrowDownUp, RotateCcw, X } from "lucide-react";

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
        "flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-surface p-3",
        className,
      )}
    >
      {children}

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-subtle hover:text-text-primary transition-colors"
        >
          <RotateCcw size={13} />
          Reset
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
  /** Show an "All" option that clears the filter (default: true) */
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
    <div className={cn("relative flex items-center gap-1.5", className)}>
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-lg border bg-surface pl-3 pr-8 py-1.5 text-xs font-medium transition-colors cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400",
          hasValue
            ? "border-brand-300 text-brand-700 bg-brand-50"
            : "border-surface-border text-text-secondary hover:border-surface-border/80",
        )}
      >
        {allowAll && <option value="">{allLabel} {label}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear chip when active */}
      {hasValue ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-brand-600 hover:bg-brand-100 transition-colors"
          aria-label={`Clear ${label}`}
        >
          <X size={12} />
        </button>
      ) : (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
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
            "pl-3 pr-8 py-1.5 text-xs font-medium text-text-secondary",
            "hover:border-surface-border/80 cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400",
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <button
        type="button"
        onClick={toggleOrder}
        title={sortOrder === "asc" ? "Ascending" : "Descending"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border",
          "text-text-muted hover:bg-surface-subtle hover:text-text-primary transition-colors",
        )}
      >
        <ArrowDownUp
          size={14}
          className={cn(
            "transition-transform",
            sortOrder === "asc" && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}