import apiClient from "@/lib/axios";
import { BATCH_ENDPOINTS } from "@/constants/api-routes/batch-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  LeadBatch,
  BatchCreateResponse,
  BatchStats,
  RetryConfig,
  RunOrScheduleBatchResponse,
} from "@/types/batch";

/**
 * Tenant campaign calling batch sequence operations.
 * Backend module: `modules/batches` (tenant routes nested inside campaigns).
 */
export const batchesApi = {
  getAll: async (campaignId: string): Promise<LeadBatch[]> => {
    const res = await apiClient.get<ApiResponse<LeadBatch[]>>(
      BATCH_ENDPOINTS.BASE(campaignId),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batches");
    }
    return res.data.data;
  },

  getById: async (campaignId: string, batchId: string): Promise<LeadBatch> => {
    const res = await apiClient.get<ApiResponse<LeadBatch>>(
      BATCH_ENDPOINTS.BY_ID(campaignId, batchId),
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
      BATCH_ENDPOINTS.BASE(campaignId),
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
  ): Promise<RunOrScheduleBatchResponse> => {
    const res = await apiClient.post<ApiResponse<RunOrScheduleBatchResponse>>(
      BATCH_ENDPOINTS.RUN(campaignId, batchId),
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
  ): Promise<RunOrScheduleBatchResponse> => {
    const res = await apiClient.post<ApiResponse<RunOrScheduleBatchResponse>>(
      BATCH_ENDPOINTS.SCHEDULE(campaignId, batchId),
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
    const res = await apiClient.post<
      ApiResponse<{ batch: LeadBatch; warning: string }>
    >(BATCH_ENDPOINTS.STOP(campaignId, batchId));
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
    const res = await apiClient.post<
      ApiResponse<{
        originalBatchId: string;
        newBatch: LeadBatch;
        remainingLeads: number;
        message: string;
      }>
    >(BATCH_ENDPOINTS.RESUME(campaignId, batchId));

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
      BATCH_ENDPOINTS.BY_ID(campaignId, batchId),
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
      BATCH_ENDPOINTS.STATS(campaignId, batchId),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batch metrics");
    }
    return res.data.data;
  },
};
