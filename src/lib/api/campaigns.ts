import apiClient from "@/lib/axios";
import { CAMPAIGN_ENDPOINTS } from "@/constants/api-routes/campaign-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Campaign,
  CampaignStats,
  CreateCampaignInput,
  ParseLeadsResult,
  CampaignPerformance,
  UpdateCampaignInput,
} from "@/types/campaign";

/**
 * Tenant campaign operations.
 * Backend module: `modules/campaigns` (tenant routes).
 */
export const campaignsApi = {
  getAll: async (): Promise<Campaign[]> => {
    const res = await apiClient.get<ApiResponse<Campaign[]>>(
      CAMPAIGN_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaigns");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get<ApiResponse<Campaign>>(
      CAMPAIGN_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign");
    }
    return res.data.data;
  },

  create: async (data: CreateCampaignInput): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(
      CAMPAIGN_ENDPOINTS.BASE,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create campaign");
    }
    return res.data.data;
  },

  update: async (id: string, data: UpdateCampaignInput): Promise<Campaign> => {
    const res = await apiClient.patch<ApiResponse<Campaign>>(
      CAMPAIGN_ENDPOINTS.BY_ID(id),
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
      CAMPAIGN_ENDPOINTS.PARSE_LEADS(id),
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
      CAMPAIGN_ENDPOINTS.STATS(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign stats");
    }
    return res.data.data;
  },

  getCampaignPerformance: async (id: string): Promise<CampaignPerformance> => {
    const res = await apiClient.get<ApiResponse<CampaignPerformance>>(
      CAMPAIGN_ENDPOINTS.PERFORMANCE(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign performance");
    }
    return res.data.data;
  },
};
