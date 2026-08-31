import apiClient from "@/lib/axios";
import { ADMIN_CALL_ENDPOINTS } from "@/constants/api-routes/admin/call-endpoint";
import type { ApiResponse, Pagination } from "@/types/api";
import type { Call, CallStats, CallTranscriptResponse } from "@/types/call";

export interface AdminCallQueryParams {
  tenantId: string;
  campaignId?: string;
  leadId?: string;
  status?: string;
  disposition?: string;
  leadTemperature?: string;
  locationMatch?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const adminCallsApi = {
  getAll: async (
    params: AdminCallQueryParams,
  ): Promise<{ calls: Call[]; pagination: Pagination }> => {
    if (!params?.tenantId || params.tenantId === "undefined") {
      return {
        calls: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      };
    }

    const res = await apiClient.get<
      ApiResponse<Call[] | { calls: Call[]; pagination: Pagination }>
    >(ADMIN_CALL_ENDPOINTS.BASE, { params });

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch calls");
    }

    // Adapt to both raw array response (V1 Admin) and paginated response
    if (Array.isArray(res.data.data)) {
      return {
        calls: res.data.data,
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

  getById: async (tenantId: string, id: string): Promise<Call> => {
    if (!tenantId || !id || tenantId === "undefined" || id === "undefined") {
      throw new Error("tenantId and callId are required");
    }
    const res = await apiClient.get<ApiResponse<Call>>(
      ADMIN_CALL_ENDPOINTS.BY_ID(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch call");
    }
    return res.data.data;
  },

  getTranscript: async (
    tenantId: string,
    id: string,
  ): Promise<CallTranscriptResponse> => {
    if (!tenantId || !id || tenantId === "undefined" || id === "undefined") {
      throw new Error("tenantId and callId are required");
    }
    const res = await apiClient.get<ApiResponse<CallTranscriptResponse>>(
      ADMIN_CALL_ENDPOINTS.TRANSCRIPT(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch transcript");
    }
    return res.data.data;
  },

  getStats: async (
    tenantId: string,
    params?: { campaignId?: string; leadId?: string },
  ): Promise<CallStats> => {
    if (!tenantId || tenantId === "undefined") {
      throw new Error("tenantId is required");
    }
    const res = await apiClient.get<ApiResponse<CallStats>>(
      ADMIN_CALL_ENDPOINTS.STATS,
      { params: { tenantId, ...params } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch call stats");
    }
    return res.data.data;
  },
};
