import apiClient from "@/lib/axios";
import { ADMIN_LEAD_ENDPOINTS } from "@/constants/api-routes/admin/lead-endpoint";
import type { ApiResponse, Pagination } from "@/types/api";
import type { Lead, LeadDetail, LeadStats } from "@/types/lead";
import { reschedulePrefetchTask } from "next/dist/client/components/segment-cache/scheduler";

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
    if (!params?.tenantId || params.tenantId === "undefined") {
      return {
        leads: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      };
    }

    const res = await apiClient.get<
      ApiResponse<Lead[] | { leads: Lead[]; pagination: Pagination }>
    >(ADMIN_LEAD_ENDPOINTS.BASE, { params });

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch leads");
    }

    // Adapt to both raw array response (V1 Admin) and paginated response
    if (Array.isArray(res.data.data)) {
      return {
        leads: res.data.data,
        pagination: {
          total: res.data.data.length,
          page: params.page ?? 1,
          limit: params.limit ?? res.data.data.length,
          pages: 1,
        },
      };
    }

    return res.data.data;
  },

  getById: async (tenantId: string, id: string): Promise<LeadDetail> => {
    if (!tenantId || !id || tenantId === "undefined" || id === "undefined") {
      throw new Error("tenantId and leadId are required");
    }
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
    if (!tenantId || tenantId === "undefined") {
      throw new Error("tenantId is required");
    }
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
