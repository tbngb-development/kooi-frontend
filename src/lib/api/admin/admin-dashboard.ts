import apiClient from "@/lib/axios";
import { ADMIN_DASHBOARD_ENDPOINTS } from "@/constants/api-routes/admin/dashboard-endpoint";
import { cleanParams } from "@/lib/utils/cleanParams";
import type { ApiResponse } from "@/types/api";
import type {
  AdminCallVolumeTrends,
  AdminDateRange,
  AdminOverview,
  AdminRevenueTrends,
  AdminTenantDistribution,
  AdminTimeSeriesFilters,
  AdminTopTenants,
  AdminTopTenantsFilters,
} from "@/types/admin-dashboard";

export const adminDashboardApi = {
  getOverview: async (filters?: AdminDateRange): Promise<AdminOverview> => {
    const res = await apiClient.get<ApiResponse<AdminOverview>>(
      ADMIN_DASHBOARD_ENDPOINTS.OVERVIEW,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(res.data.error ?? "Failed to fetch admin overview");
    }
    return res.data.data;
  },

  getRevenueTrends: async (
    filters?: AdminTimeSeriesFilters,
  ): Promise<AdminRevenueTrends> => {
    const res = await apiClient.get<ApiResponse<AdminRevenueTrends>>(
      ADMIN_DASHBOARD_ENDPOINTS.REVENUE_TRENDS,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(
        res.data.error ?? "Failed to fetch platform revenue trends",
      );
    }

    console.log("Revenue overtime: ", res.data)
    return res.data.data;
  },

  getCallVolumeTrends: async (
    filters?: AdminTimeSeriesFilters,
  ): Promise<AdminCallVolumeTrends> => {
    const res = await apiClient.get<ApiResponse<AdminCallVolumeTrends>>(
      ADMIN_DASHBOARD_ENDPOINTS.CALL_VOLUME_TRENDS,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(
        res.data.error ?? "Failed to fetch platform call volume trends",
      );
    }
    console.log("total call volume: ", res.data)
    return res.data.data;
  },

  getTenantDistribution: async (): Promise<AdminTenantDistribution> => {
    const res = await apiClient.get<ApiResponse<AdminTenantDistribution>>(
      ADMIN_DASHBOARD_ENDPOINTS.TENANT_DISTRIBUTION,
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(
        res.data.error ?? "Failed to fetch tenant plan distribution",
      );
    }
    return res.data.data;
  },

  getTopTenants: async (
    filters?: AdminTopTenantsFilters,
  ): Promise<AdminTopTenants> => {
    const res = await apiClient.get<ApiResponse<AdminTopTenants>>(
      ADMIN_DASHBOARD_ENDPOINTS.TOP_TENANTS,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(
        res.data.error ?? "Failed to fetch top tenants leaderboard",
      );
    }
    return res.data.data;
  },
};
