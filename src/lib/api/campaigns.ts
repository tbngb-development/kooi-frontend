import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  Campaign,
  CampaignStats,
  CreateCampaignInput,
  ParseLeadsResult,
  CampaignPerformance,
  UpdateCampaignInput,
} from "@/types/campaign";

// V1: Campaigns architecture mapped to /api/v1/campaigns
export const campaignsApi = {
  getAll: async (): Promise<Campaign[]> => {
    const res =
      await apiClient.get<ApiResponse<Campaign[]>>("/api/v1/campaigns");
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaigns");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get<ApiResponse<Campaign>>(
      `/api/v1/campaigns/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign");
    }
    return res.data.data;
  },

  create: async (data: CreateCampaignInput): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(
      "/api/v1/campaigns",
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create campaign");
    }
    return res.data.data;
  },

  update: async (id: string, data: UpdateCampaignInput): Promise<Campaign> => {
    const res = await apiClient.patch<ApiResponse<Campaign>>(
      `/api/v1/campaigns/${id}`,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update campaign");
    }
    return res.data.data;
  },

  parseCSV: async (id: string, file: File): Promise<ParseLeadsResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<ParseLeadsResult>>(
      `/api/v1/campaigns/${id}/parse-leads`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to parse file");
    }
    return res.data.data;
  },

  getStats: async (id: string): Promise<CampaignStats> => {
    const res = await apiClient.get<ApiResponse<CampaignStats>>(
      `/api/v1/campaigns/${id}/stats`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign stats");
    }
    return res.data.data;
  },

  getCampaignPerformance: async (id: string): Promise<CampaignPerformance> => {
    const res = await apiClient.get<ApiResponse<CampaignPerformance>>(
      `/api/v1/campaigns/${id}/performance`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign performance");
    }
    return res.data.data;
  },

  /*
   * ── DEPRECATED IN V1 ──────────────────────────────────────────────────────────
   * The following actions are removed on the v1 Campaign Controller.
   * Uploading, running, scheduling, and stopping calls is now delegated directly
   * to Batches API: `/api/v1/campaigns/:campaignId/batches/:batchId/[run|schedule|stop]`.
   */
  /** @deprecated Use batchesApi.create */
  uploadCSV: () => {
    throw new Error(
      "Deprecated in V1. Please configure your batch sequence via Batches API instead.",
    );
  },
  /** @deprecated Use batchesApi.run */
  start: () => {
    throw new Error(
      "Deprecated in V1. Please fire a batch run via batchesApi.run instead.",
    );
  },
  /** @deprecated Use batchesApi.stop */
  pause: () => {
    throw new Error(
      "Deprecated in V1. Please halt batches via batchesApi.stop instead.",
    );
  },
  /** @deprecated Use batchesApi.stop */
  cancelSchedule: () => {
    throw new Error("Deprecated in V1. Use batchesApi.stop instead.");
  },
};
