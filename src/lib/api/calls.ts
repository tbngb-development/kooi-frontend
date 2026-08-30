import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Call,
  CallQueryParams,
  CallTranscriptResponse,
  PaginatedCallsResponse,
  Pagination,
  CallStats,
} from "@/types";

// V1: Voice Call queries mapped to /api/v1/calls
export const callsApi = {
  getAll: async (
    params: CallQueryParams = {},
  ): Promise<{ calls: Call[]; pagination: Pagination }> => {
    const res = await apiClient.get<PaginatedCallsResponse<Call>>("/api/v1/calls", {
      params,
    });
    if (!res.data.success || !res.data.data) {
      throw new Error("Failed to fetch calls");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Call> => {
    const res = await apiClient.get<ApiResponse<Call>>(`/api/v1/calls/${id}`);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch call");
    }
    return res.data.data;
  },

  getTranscript: async (id: string): Promise<CallTranscriptResponse> => {
    const res = await apiClient.get<ApiResponse<CallTranscriptResponse>>(
      `/api/v1/calls/${id}/transcript`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch transcript");
    }
    return res.data.data;
  },

  getCallStats: async (params?: { campaignId?: string }): Promise<CallStats> => {
    const res = await apiClient.get<ApiResponse<CallStats>>("/api/v1/calls/stats", { params });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch call statistics");
    }
    return res.data.data;
  },
};