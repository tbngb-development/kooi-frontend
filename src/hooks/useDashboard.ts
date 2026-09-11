"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type {
  DashboardFilters,
  DashboardTimeSeriesFilters,
  TopCampaignsFilters,
} from "@/types/dashboard";

/**
 * All dashboard hooks share:
 *  - staleTime: 30s (dashboards should feel fresh but avoid thrashing)
 *  - gcTime: 5m
 *
 * Realtime feeds (recent activity) refetch more aggressively.
 */
const DEFAULT_STALE_TIME = 30_000;
const DEFAULT_GC_TIME = 5 * 60_000;

export function useDashboardOverview(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.overview(filters),
    queryFn: () => dashboardApi.getOverview(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardCallTrends(filters: DashboardTimeSeriesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.callTrends(filters),
    queryFn: () => dashboardApi.getCallTrends(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardSpendTrends(filters: DashboardTimeSeriesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.spendTrends(filters),
    queryFn: () => dashboardApi.getSpendTrends(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardLeadFunnel(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.leadFunnel(filters),
    queryFn: () => dashboardApi.getLeadFunnel(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardDispositionBreakdown(
  filters: DashboardFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.dispositionBreakdown(filters),
    queryFn: () => dashboardApi.getDispositionBreakdown(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardTemperatureDistribution(
  filters: DashboardFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.temperatureDistribution(filters),
    queryFn: () => dashboardApi.getTemperatureDistribution(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardCampaignPerformance(
  filters: DashboardFilters = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.campaignPerformance(filters),
    queryFn: () => dashboardApi.getCampaignPerformance(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardTopCampaigns(filters: TopCampaignsFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.topCampaigns(filters),
    queryFn: () => dashboardApi.getTopCampaigns(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useDashboardRecentActivity() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.recentActivity(),
    queryFn: dashboardApi.getRecentActivity,
    staleTime: 15_000,
    refetchInterval: 30_000,
    gcTime: DEFAULT_GC_TIME,
  });
}
