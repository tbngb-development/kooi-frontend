// src/lib/api/leads.ts
import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Lead,
  LeadDetail,
  LeadQueryParams,
  LeadStats,
  PaginatedData,
  PaginatedResponse,
} from "@/types";

export const leadsApi = {
  getAll: async (
    params: LeadQueryParams = {},
  ): Promise<PaginatedData<Lead>> => {
    const res = await apiClient.get<PaginatedResponse<Lead>>("/api/leads", {
      params,
    });
    if (!res.data.success || !res.data.data) {
      throw new Error("Failed to fetch leads");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<LeadDetail> => {
    const res = await apiClient.get<ApiResponse<LeadDetail>>(
      `/api/leads/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch lead");
    }
    return res.data.data;
  },

  getStats: async (params?: { campaignId?: string }): Promise<LeadStats> => {
    const res = await apiClient.get<ApiResponse<LeadStats>>(
      "/api/leads/stats",
      {
        params,
      },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch lead stats");
    }
    return res.data.data;
  },
};
