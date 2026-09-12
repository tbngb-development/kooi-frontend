"use client";

import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "@/lib/api/admin/admin-dashboard";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type {
  AdminDateRange,
  AdminTimeSeriesFilters,
  AdminTopTenantsFilters,
} from "@/types/admin-dashboard";

const DEFAULT_STALE_TIME = 30_000;
const DEFAULT_GC_TIME = 5 * 60_000;

export function useAdminDashboardOverview(filters: AdminDateRange = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.overview(filters),
    queryFn: () => adminDashboardApi.getOverview(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useAdminRevenueTrends(filters: AdminTimeSeriesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.revenueTrends(filters),
    queryFn: () => adminDashboardApi.getRevenueTrends(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useAdminCallVolumeTrends(filters: AdminTimeSeriesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.callVolumeTrends(filters),
    queryFn: () => adminDashboardApi.getCallVolumeTrends(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useAdminTenantDistribution() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.tenantDistribution(),
    queryFn: adminDashboardApi.getTenantDistribution,
    staleTime: 60_000,
    gcTime: DEFAULT_GC_TIME,
  });
}

export function useAdminTopTenants(filters: AdminTopTenantsFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.topTenants(filters),
    queryFn: () => adminDashboardApi.getTopTenants(filters),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

