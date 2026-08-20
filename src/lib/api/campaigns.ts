// src/lib/api/campaigns.ts

import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Campaign,
  CampaignStats,
  CreateCampaignInput,
  UpdateCampaignInput,
  UploadResult,
} from "@/types";

// Shape returned by POST /campaigns/:id/start
interface StartCampaignResult {
  message: string;
  totalLeads: number;
  variableKeys: string[];
}

export const campaignsApi = {
  getAll: async (): Promise<Campaign[]> => {
    const res = await apiClient.get<ApiResponse<Campaign[]>>("/api/campaigns");
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaigns");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get<ApiResponse<Campaign>>(
      `/api/campaigns/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign");
    }
    return res.data.data;
  },

  create: async (data: CreateCampaignInput): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(
      "/api/campaigns",
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create campaign");
    }
    return res.data.data;
  },

  update: async (id: string, data: UpdateCampaignInput): Promise<Campaign> => {
    const res = await apiClient.patch<ApiResponse<Campaign>>(
      `/api/campaigns/${id}`,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update campaign");
    }
    return res.data.data;
  },

  uploadCSV: async (
    id: string,
    file: File,
    allowDuplicates = false, // 👈 new param
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const url = allowDuplicates
      ? `/api/campaigns/${id}/upload?allowDuplicates=true`
      : `/api/campaigns/${id}/upload`;

    const res = await apiClient.post<ApiResponse<UploadResult>>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to upload file");
    }
    return res.data.data;
  },
  // Returns StartCampaignResult — not Campaign — matches backend response shape
  start: async (id: string): Promise<StartCampaignResult> => {
    const res = await apiClient.post<ApiResponse<StartCampaignResult>>(
      `/api/campaigns/${id}/start`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to start campaign");
    }
    return res.data.data;
  },

  pause: async (id: string): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(
      `/api/campaigns/${id}/pause`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to pause campaign");
    }
    return res.data.data;
  },

  getStats: async (id: string): Promise<CampaignStats> => {
    const res = await apiClient.get<ApiResponse<CampaignStats>>(
      `/api/campaigns/${id}/stats`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch campaign stats");
    }
    return res.data.data;
  },
};
