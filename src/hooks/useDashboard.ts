"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useDashboardOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.overview(),
    queryFn: dashboardApi.getOverview,
    refetchInterval: 30000, // Safe 30s background sync
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.activity(),
    queryFn: dashboardApi.getActivity,
    refetchInterval: 15000, // Safe 15s sync for feed
  });
}

export function useDashboardCampaigns() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.campaigns(),
    queryFn: dashboardApi.getCampaigns,
    refetchInterval: 15000,
  });
}
