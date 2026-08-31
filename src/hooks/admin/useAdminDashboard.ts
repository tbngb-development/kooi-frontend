"use client";

import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "@/lib/api/admin/admin-dashboard";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.overview(),
    queryFn: adminDashboardApi.getOverview,
  });
}

export function useAdminTenantsHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.tenantsHealth(),
    queryFn: adminDashboardApi.getTenantsHealth,
  });
}

export function useAdminActivity(limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD.activity(),
    queryFn: () => adminDashboardApi.getActivity(limit),
  });
}
