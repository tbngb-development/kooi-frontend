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
    const res = await apiClient.get<
      ApiResponse<{ calls: Call[]; pagination: Pagination }>
    >(ADMIN_CALL_ENDPOINTS.BASE, { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch calls");
    }
    return res.data.data;
  },

  getById: async (tenantId: string, id: string): Promise<Call> => {
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
