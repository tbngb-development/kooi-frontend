// src/lib/api/campaigns.ts

import apiClient from '@/lib/axios';
import type {
  ApiResponse,
  Campaign,
  CampaignStats,
  CreateCampaignInput,
  UpdateCampaignInput,
  UploadResult,
} from '@/types';

export const campaignsApi = {
  getAll: async (): Promise<Campaign[]> => {
    const res = await apiClient.get<ApiResponse<Campaign[]>>('/api/campaigns');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to fetch campaigns');
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get<ApiResponse<Campaign>>(
      `/api/campaigns/${id}`
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to fetch campaign');
    }
    return res.data.data;
  },

  create: async (data: CreateCampaignInput): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(
      '/api/campaigns',
      data
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to create campaign');
    }
    return res.data.data;
  },

  update: async (
    id: string,
    data: UpdateCampaignInput
  ): Promise<Campaign> => {
    const res = await apiClient.patch<ApiResponse<Campaign>>(
      `/api/campaigns/${id}`,
      data
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to update campaign');
    }
    return res.data.data;
  },

  uploadCSV: async (id: string, file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<UploadResult>>(
      `/api/campaigns/${id}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to upload CSV');
    }
    return res.data.data;
  },

  start: async (id: string): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(
      `/api/campaigns/${id}/start`
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to start campaign');
    }
    return res.data.data;
  },

  pause: async (id: string): Promise<Campaign> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(
      `/api/campaigns/${id}/pause`
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to pause campaign');
    }
    return res.data.data;
  },

  getStats: async (id: string): Promise<CampaignStats> => {
    const res = await apiClient.get<ApiResponse<CampaignStats>>(
      `/api/campaigns/${id}/stats`
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to fetch campaign stats');
    }
    return res.data.data;
  },
};