import apiClient from "@/lib/axios";
import { ADMIN_DASHBOARD_ENDPOINTS } from "@/constants/api-routes/admin/dashboard-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  AdminDashboardOverview,
  AdminTenantHealth,
  AdminActivityItem,
} from "@/types/admin-dashboard";

export const adminDashboardApi = {
  getOverview: async (): Promise<AdminDashboardOverview> => {
    const res = await apiClient.get<ApiResponse<AdminDashboardOverview>>(
      ADMIN_DASHBOARD_ENDPOINTS.OVERVIEW,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch admin overview");
    }
    return res.data.data;
  },

  getTenantsHealth: async (): Promise<AdminTenantHealth[]> => {
    const res = await apiClient.get<ApiResponse<AdminTenantHealth[]>>(
      ADMIN_DASHBOARD_ENDPOINTS.TENANTS_HEALTH,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenants health");
    }
    return res.data.data;
  },

  getActivity: async (limit = 20): Promise<AdminActivityItem[]> => {
    const res = await apiClient.get<ApiResponse<AdminActivityItem[]>>(
      ADMIN_DASHBOARD_ENDPOINTS.ACTIVITY,
      { params: { limit } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch admin activity");
    }
    return res.data.data;
  },
};
