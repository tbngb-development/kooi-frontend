import apiClient from "@/lib/axios";
import { DASHBOARD_ENDPOINTS } from "@/constants/api-routes/dashboard-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  DashboardActivity,
  DashboardCampaign,
  DashboardOverview,
} from "@/types/dashboard";

/**
 * Tenant metrics and overview aggregation API.
 * Backend module: `modules/dashboard` (tenant routes).
 */
export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await apiClient.get<ApiResponse<DashboardOverview>>(
      DASHBOARD_ENDPOINTS.OVERVIEW,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch overview");
    }
    return res.data.data;
  },

  getActivity: async (): Promise<DashboardActivity> => {
    const res = await apiClient.get<ApiResponse<DashboardActivity>>(
      DASHBOARD_ENDPOINTS.ACTIVITY,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch activity");
    }
    return res.data.data;
  },

  getCampaigns: async (): Promise<DashboardCampaign[]> => {
    const res = await apiClient.get<ApiResponse<DashboardCampaign[]>>(
      DASHBOARD_ENDPOINTS.CAMPAIGNS,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch dashboard campaigns");
    }
    return res.data.data;
  },
};
