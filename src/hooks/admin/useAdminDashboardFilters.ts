"use client";

import { useCallback, useMemo, useState } from "react";
import type { AdminDateRange } from "@/types/admin-dashboard";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultRange(): Required<AdminDateRange> {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);
  return {
    dateFrom: toISODate(thirtyDaysAgo),
    dateTo: toISODate(today),
  };
}

export function useAdminDashboardFilters() {
  const [filters, setFilters] =
    useState<Required<AdminDateRange>>(defaultRange);

  const reset = useCallback(() => setFilters(defaultRange()), []);

  const apiFilters: AdminDateRange = useMemo(() => {
    const out: AdminDateRange = {};
    if (filters.dateFrom) out.dateFrom = filters.dateFrom;
    if (filters.dateTo) out.dateTo = filters.dateTo;
    return out;
  }, [filters]);

  return { filters, setFilters, reset, apiFilters };
}
