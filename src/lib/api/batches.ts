import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  LeadBatch,
  BatchCreateResponse,
  BatchStats,
  RetryConfig,
} from "@/types/batch";

// V1: Batches interface nested perfectly inside V1 campaigns router /api/v1/campaigns
const BASE = "/api/v1/campaigns";

export const batchesApi = {
  getAll: async (campaignId: string): Promise<LeadBatch[]> => {
    const res = await apiClient.get<ApiResponse<LeadBatch[]>>(`${BASE}/${campaignId}/batches`);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batches");
    }
    return res.data.data;
  },

  getById: async (campaignId: string, batchId: string): Promise<LeadBatch> => {
    const res = await apiClient.get<ApiResponse<LeadBatch>>(
      `${BASE}/${campaignId}/batches/${batchId}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batch details");
    }
    return res.data.data;
  },

  create: async (
    campaignId: string,
    file: File,
    retryConfig?: RetryConfig,
  ): Promise<BatchCreateResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (retryConfig) {
      formData.append("retryConfig", JSON.stringify(retryConfig));
    }

    const res = await apiClient.post<ApiResponse<BatchCreateResponse>>(
      `${BASE}/${campaignId}/batches`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create batch pipeline");
    }
    return res.data.data;
  },

  run: async (
    campaignId: string,
    batchId: string,
  ): Promise<{ batch: LeadBatch; message: string }> => {
    const res = await apiClient.post<ApiResponse<{ batch: LeadBatch; message: string }>>(
      `${BASE}/${campaignId}/batches/${batchId}/run`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to run batch");
    }
    return res.data.data;
  },

  schedule: async (
    campaignId: string,
    batchId: string,
    scheduledAt: string,
  ): Promise<{ batch: LeadBatch; message: string }> => {
    const res = await apiClient.post<ApiResponse<{ batch: LeadBatch; message: string }>>(
      `${BASE}/${campaignId}/batches/${batchId}/schedule`,
      { scheduledAt },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to schedule batch start");
    }
    return res.data.data;
  },

  stop: async (
    campaignId: string,
    batchId: string,
  ): Promise<{ batch: LeadBatch; warning: string }> => {
    const res = await apiClient.post<ApiResponse<{ batch: LeadBatch; warning: string }>>(
      `${BASE}/${campaignId}/batches/${batchId}/stop`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to stop batch progress");
    }
    return res.data.data;
  },

  resume: async (
    campaignId: string,
    batchId: string,
  ): Promise<{
    originalBatchId: string;
    newBatch: LeadBatch;
    remainingLeads: number;
    message: string;
  }> => {
    const res = await apiClient.post<ApiResponse<{
      originalBatchId: string;
      newBatch: LeadBatch;
      remainingLeads: number;
      message: string;
    }>>(`${BASE}/${campaignId}/batches/${batchId}/resume`);
    
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to resume halted batch");
    }
    return res.data.data;
  },

  delete: async (
    campaignId: string,
    batchId: string,
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${BASE}/${campaignId}/batches/${batchId}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to delete batch");
    }
    return res.data.data;
  },

  getStats: async (
    campaignId: string,
    batchId: string,
  ): Promise<BatchStats> => {
    const res = await apiClient.get<ApiResponse<BatchStats>>(
      `${BASE}/${campaignId}/batches/${batchId}/stats`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batch metrics");
    }
    return res.data.data;
  },
};