"use client";

import { Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminDateRange } from "@/types/admin-dashboard";

interface Props {
  value: Required<AdminDateRange>;
  onChange: (next: Required<AdminDateRange>) => void;
  onReset: () => void;
}

export function AdminDashboardFilters({ value, onChange, onReset }: Props) {
  const hasActiveFilters = Boolean(value.dateFrom || value.dateTo);

  return (
    <div className="bg-surface rounded-xl border border-surface-border p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-end gap-3.5 flex-wrap w-full">
      
      {/* ─── Start Date ─── */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px] sm:max-w-[200px]">
        <label 
          htmlFor="admin-date-from"
          className="text-xs font-bold uppercase tracking-wider text-text-muted"
        >
          Start Date
        </label>
        <div className="relative">
          <input
            id="admin-date-from"
            type="date"
            value={value.dateFrom}
            max={value.dateTo || undefined}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            className="w-full h-9 rounded-md border border-surface-border bg-surface pl-9 pr-3 text-base text-text-primary transition-colors duration-150 hover:border-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
          />
          <Calendar
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none"
          />
        </div>
      </div>

      {/* ─── End Date ─── */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px] sm:max-w-[200px]">
        <label 
          htmlFor="admin-date-to"
          className="text-xs font-bold uppercase tracking-wider text-text-muted"
        >
          End Date
        </label>
        <div className="relative">
          <input
            id="admin-date-to"
            type="date"
            value={value.dateTo}
            min={value.dateFrom || undefined}
            onChange={(e) => onChange({ ...value, dateFrom: value.dateFrom, dateTo: e.target.value })}
            className="w-full h-9 rounded-md border border-surface-border bg-surface pl-9 pr-3 text-base text-text-primary transition-colors duration-150 hover:border-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
          />
          <Calendar
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none"
          />
        </div>
      </div>

      {/* ─── Reset Action Button ─── */}
      <div className="shrink-0 sm:w-auto w-full sm:ml-auto">
        <Button
          variant={hasActiveFilters ? "outline" : "ghost"}
          size="md"
          onClick={onReset}
          disabled={!hasActiveFilters}
          leftIcon={<RotateCcw size={14} />}
          className="w-full sm:w-auto"
        >
          Reset Filters
        </Button>
      </div>

    </div>
  );
}