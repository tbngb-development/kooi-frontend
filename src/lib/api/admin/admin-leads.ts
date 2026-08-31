import apiClient from "@/lib/axios";
import { ADMIN_LEAD_ENDPOINTS } from "@/constants/api-routes/admin/lead-endpoint";
import type { ApiResponse, Pagination } from "@/types/api";
import type { Lead, LeadDetail, LeadStats } from "@/types/lead";

export interface AdminLeadQueryParams {
  tenantId: string;
  campaignId?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const adminLeadsApi = {
  getAll: async (
    params: AdminLeadQueryParams,
  ): Promise<{ leads: Lead[]; pagination: Pagination }> => {
    const res = await apiClient.get<
      ApiResponse<{ leads: Lead[]; pagination: Pagination }>
    >(ADMIN_LEAD_ENDPOINTS.BASE, { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch leads");
    }
    return res.data.data;
  },

  getById: async (tenantId: string, id: string): Promise<LeadDetail> => {
    const res = await apiClient.get<ApiResponse<LeadDetail>>(
      ADMIN_LEAD_ENDPOINTS.BY_ID(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch lead");
    }
    return res.data.data;
  },

  getStats: async (
    tenantId: string,
    campaignId?: string,
  ): Promise<LeadStats> => {
    const res = await apiClient.get<ApiResponse<LeadStats>>(
      ADMIN_LEAD_ENDPOINTS.STATS,
      { params: { tenantId, campaignId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch lead stats");
    }
    return res.data.data;
  },
};
