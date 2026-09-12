"use client";

import { useCallback, useMemo, useState } from "react";
import type { DashboardFilters } from "@/types/dashboard";

/** Format a Date as YYYY-MM-DD in local time (matches <input type="date">). */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultRange(): Required<DashboardFilters> {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);
  return {
    dateFrom: toISODate(thirtyDaysAgo),
    dateTo: toISODate(today),
    campaignId: "",
  };
}

/**
 * Central hook for dashboard filter state.
 *
 * Returns `filters` (with empty strings for defaults, useful for controlled UI)
 * and `apiFilters` (with empty values stripped, ready to pass into hooks).
 */
export function useDashboardFilters() {
  const [filters, setFilters] =
    useState<Required<DashboardFilters>>(defaultRange);

  const reset = useCallback(() => setFilters(defaultRange()), []);

  const apiFilters: DashboardFilters = useMemo(() => {
    const out: DashboardFilters = {};
    if (filters.dateFrom) out.dateFrom = filters.dateFrom;
    if (filters.dateTo) out.dateTo = filters.dateTo;
    if (filters.campaignId) out.campaignId = filters.campaignId;
    return out;
  }, [filters]);

  return { filters, setFilters, reset, apiFilters };
}
