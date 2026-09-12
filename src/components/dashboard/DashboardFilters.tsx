"use client";

import { useMemo } from "react";
import { Calendar, RotateCcw, } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCampaigns } from "@/hooks/useCampaigns";
import type { DashboardFilters as Filters } from "@/types/dashboard";

interface Props {
  value: Required<Filters>;
  onChange: (next: Required<Filters>) => void;
  onReset: () => void;
}

const ALL_CAMPAIGNS = "";

export function DashboardFilters({ value, onChange, onReset }: Props) {
  const { data: campaigns } = useCampaigns();

  const campaignOptions = useMemo(() => {
    const opts = [{ value: ALL_CAMPAIGNS, label: "All Active Campaigns" }];
    (campaigns ?? []).forEach((c) => {
      opts.push({ value: c.id, label: c.name });
    });
    return opts;
  }, [campaigns]);

  const hasActiveFilters = Boolean(
    value.dateFrom || value.dateTo || value.campaignId !== ALL_CAMPAIGNS,
  );

  return (
    <div className="bg-surface rounded-xl border border-surface-border p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-end gap-3.5 flex-wrap w-full">
      {/* ─── Start Date ─── */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px] sm:max-w-[200px]">
        <label
          htmlFor="dashboard-date-from"
          className="text-xs font-bold uppercase tracking-wider text-text-muted"
        >
          Start Date
        </label>
        <div className="relative">
          <input
            id="dashboard-date-from"
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
          htmlFor="dashboard-date-to"
          className="text-xs font-bold uppercase tracking-wider text-text-muted"
        >
          End Date
        </label>
        <div className="relative">
          <input
            id="dashboard-date-to"
            type="date"
            value={value.dateTo}
            min={value.dateFrom || undefined}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            className="w-full h-9 rounded-md border border-surface-border bg-surface pl-9 pr-3 text-base text-text-primary transition-colors duration-150 hover:border-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
          />
          <Calendar
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none"
          />
        </div>
      </div>

      {/* ─── Campaign Target Dropdown ─── */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] sm:max-w-[280px]">
        <label
          htmlFor="dashboard-campaign-filter"
          className="text-xs font-bold uppercase tracking-wider text-text-muted"
        >
          Campaign Target
        </label>
        <Select
          id="dashboard-campaign-filter"
          options={campaignOptions}
          value={value.campaignId}
          onChange={(e) => onChange({ ...value, campaignId: e.target.value })}
        />
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
