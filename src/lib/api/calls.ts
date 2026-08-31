import apiClient from "@/lib/axios";
import { CALL_ENDPOINTS } from "@/constants/api-routes/call-endpoint";
import type {
  ApiResponse,
  PaginatedCallsResponse,
  Pagination,
} from "@/types/api";
import type {
  Call,
  CallQueryParams,
  CallStats,
  CallTranscriptResponse,
} from "@/types/call";

/**
 * Tenant call operations API.
 * Backend module: `modules/calls` (tenant routes).
 */
export const callsApi = {
  getAll: async (
    params: CallQueryParams = {},
  ): Promise<{ calls: Call[]; pagination: Pagination }> => {
    const res = await apiClient.get<PaginatedCallsResponse<Call>>(
      CALL_ENDPOINTS.BASE,
      { params },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error("Failed to fetch calls");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Call> => {
    const res = await apiClient.get<ApiResponse<Call>>(
      CALL_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch call");
    }
    return res.data.data;
  },

  getTranscript: async (id: string): Promise<CallTranscriptResponse> => {
    const res = await apiClient.get<ApiResponse<CallTranscriptResponse>>(
      CALL_ENDPOINTS.TRANSCRIPT(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch transcript");
    }
    return res.data.data;
  },

  getCallStats: async (params?: {
    campaignId?: string;
  }): Promise<CallStats> => {
    const res = await apiClient.get<ApiResponse<CallStats>>(
      CALL_ENDPOINTS.STATS,
      { params },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch call statistics");
    }
    return res.data.data;
  },
};
