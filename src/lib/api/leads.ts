import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Lead,
  LeadDetail,
  LeadQueryParams,
  LeadStats,
  PaginatedLeadsResponse,
  Pagination,
} from "@/types";

// V1: Leads query API mapped to /api/v1/leads
export const leadsApi = {
  getAll: async (
    params: LeadQueryParams = {},
  ): Promise<{ leads: Lead[]; pagination: Pagination }> => {
    const res = await apiClient.get<PaginatedLeadsResponse<Lead>>("/api/v1/leads", {
      params,
    });
    if (!res.data.success || !res.data.data) {
      throw new Error("Failed to fetch leads");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<LeadDetail> => {
    const res = await apiClient.get<ApiResponse<LeadDetail>>(
      `/api/v1/leads/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch lead");
    }
    return res.data.data;
  },

  getStats: async (params?: { campaignId?: string }): Promise<LeadStats> => {
    const res = await apiClient.get<ApiResponse<LeadStats>>(
      "/api/v1/leads/stats",
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