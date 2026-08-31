import apiClient from "@/lib/axios";
import { LEAD_ENDPOINTS } from "@/constants/api-routes/lead-endpoint";
import type {
  ApiResponse,
  PaginatedLeadsResponse,
  Pagination,
} from "@/types/api";
import type {
  Lead,
  LeadDetail,
  LeadQueryParams,
  LeadStats,
} from "@/types/lead";

/**
 * Tenant lead operations API.
 * Backend module: `modules/leads` (tenant routes).
 */
export const leadsApi = {
  getAll: async (
    params: LeadQueryParams = {},
  ): Promise<{ leads: Lead[]; pagination: Pagination }> => {
    const res = await apiClient.get<PaginatedLeadsResponse<Lead>>(
      LEAD_ENDPOINTS.BASE,
      { params },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error("Failed to fetch leads");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<LeadDetail> => {
    const res = await apiClient.get<ApiResponse<LeadDetail>>(
      LEAD_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch lead");
    }
    return res.data.data;
  },

  getStats: async (params?: { campaignId?: string }): Promise<LeadStats> => {
    const res = await apiClient.get<ApiResponse<LeadStats>>(
      LEAD_ENDPOINTS.STATS,
      { params },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch lead stats");
    }
    return res.data.data;
  },
};
