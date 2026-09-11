"use client";

import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCampaigns } from "@/hooks/useCampaigns";
import type { DashboardFilters as Filters } from "@/types/dashboard";
import { RotateCcw, Calendar } from "lucide-react";
import { useMemo } from "react";

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

  const hasActiveFilters =
    value.dateFrom || value.dateTo || value.campaignId !== ALL_CAMPAIGNS;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 bg-surface border border-surface-border rounded-xl shadow-xs">
      {/* Date From */}
      <div className="flex flex-col gap-1.5 flex-1 sm:min-w-[150px]">
        <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          Start Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={value.dateFrom}
            max={value.dateTo || undefined}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            className="w-full h-10 rounded-lg border border-surface-border bg-surface pl-10 pr-3 text-sm font-semibold text-text-primary transition-all hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 cursor-pointer"
          />
          <Calendar
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none"
          />
        </div>
      </div>

      {/* Date To */}
      <div className="flex flex-col gap-1.5 flex-1 sm:min-w-[150px]">
        <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          End Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={value.dateTo}
            min={value.dateFrom || undefined}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            className="w-full h-10 rounded-lg border border-surface-border bg-surface pl-10 pr-3 text-sm font-semibold text-text-primary transition-all hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 cursor-pointer"
          />
          <Calendar
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none"
          />
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="flex-1 sm:min-w-[220px]">
        <Select
          label="Filter by Campaign"
          options={campaignOptions}
          value={value.campaignId}
          onChange={(e) => onChange({ ...value, campaignId: e.target.value })}
          className="h-10"
        />
      </div>

      {/* Reset Action */}
      <Button
        variant={hasActiveFilters ? "outline" : "ghost"}
        className="h-10 px-4 shrink-0 sm:w-auto w-full"
        onClick={onReset}
        disabled={!hasActiveFilters}
        leftIcon={<RotateCcw size={14} />}
      >
        Reset Filters
      </Button>
    </div>
  );
}
