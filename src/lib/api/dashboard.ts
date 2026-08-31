import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DashboardActivity,
  DashboardCampaign,
  DashboardOverview,
} from "@/types/dashboard";

// V1: Realtime metric aggregation queries mapped to /api/v1/dashboard/*
export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await apiClient.get<ApiResponse<DashboardOverview>>(
      "/api/v1/dashboard/overview",
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch overview");
    }
    return res.data.data;
  },

  getActivity: async (): Promise<DashboardActivity> => {
    const res = await apiClient.get<ApiResponse<DashboardActivity>>(
      "/api/v1/dashboard/activity",
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch activity");
    }
    return res.data.data;
  },

  getCampaigns: async (): Promise<DashboardCampaign[]> => {
    const res = await apiClient.get<ApiResponse<DashboardCampaign[]>>(
      "/api/v1/dashboard/campaigns",
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch dashboard campaigns");
    }
    return res.data.data;
  },
};
