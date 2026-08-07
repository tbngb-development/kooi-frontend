// src/lib/api/dashboard.ts

import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  DashboardActivity,
  DashboardCampaign,
  DashboardOverview,
} from "@/types";

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await apiClient.get<ApiResponse<DashboardOverview>>(
      "/api/dashboard/overview",
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch overview");
    }
    return res.data.data;
  },

  getActivity: async (): Promise<DashboardActivity> => {
    const res = await apiClient.get<ApiResponse<DashboardActivity>>(
      "/api/dashboard/activity",
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch activity");
    }
    return res.data.data;
  },

  getCampaigns: async (): Promise<DashboardCampaign[]> => {
    const res = await apiClient.get<ApiResponse<DashboardCampaign[]>>(
      "/api/dashboard/campaigns",
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch dashboard campaigns");
    }
    return res.data.data;
  },
};
