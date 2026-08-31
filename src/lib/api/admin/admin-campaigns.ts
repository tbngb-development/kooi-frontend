import apiClient from "@/lib/axios";
import { ADMIN_CAMPAIGN_ENDPOINTS } from "@/constants/api-routes/admin/campaign-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Campaign,
  CampaignStats,
  CampaignPerformance,
} from "@/types/campaign";

export const adminCampaignsApi = {
  getAll: async (tenantId: string): Promise<Campaign[]> => {
    if (!tenantId || tenantId === "undefined") return [];
    const res = await apiClient.get<ApiResponse<Campaign[]>>(
      ADMIN_CAMPAIGN_ENDPOINTS.BASE,
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaigns");
    }
    return res.data.data;
  },

  getById: async (tenantId: string, id: string): Promise<Campaign> => {
    if (!tenantId || !id || tenantId === "undefined" || id === "undefined") {
      throw new Error("tenantId and campaignId are required");
    }
    const res = await apiClient.get<ApiResponse<Campaign>>(
      ADMIN_CAMPAIGN_ENDPOINTS.BY_ID(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign");
    }
    return res.data.data;
  },

  getStats: async (tenantId: string, id: string): Promise<CampaignStats> => {
    if (!tenantId || !id || tenantId === "undefined" || id === "undefined") {
      throw new Error("tenantId and campaignId are required");
    }
    const res = await apiClient.get<ApiResponse<CampaignStats>>(
      ADMIN_CAMPAIGN_ENDPOINTS.STATS(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign stats");
    }
    return res.data.data;
  },

  getPerformance: async (
    tenantId: string,
    id: string,
  ): Promise<CampaignPerformance> => {
    if (!tenantId || !id || tenantId === "undefined" || id === "undefined") {
      throw new Error("tenantId and campaignId are required");
    }
    const res = await apiClient.get<ApiResponse<CampaignPerformance>>(
      ADMIN_CAMPAIGN_ENDPOINTS.PERFORMANCE(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign performance");
    }
    return res.data.data;
  },
};
