import axios from "../axios";
import type {
  LeadBatch,
  BatchCreateResponse,
  BatchStats,
  RetryConfig,
} from "@/types/batch";

// ✅ FIXED: Plural and includes /api prefix
const BASE = "/api/campaigns";

export const batchesApi = {
  getAll: async (campaignId: string): Promise<LeadBatch[]> => {
    const { data } = await axios.get(`${BASE}/${campaignId}/batches`);
    console.log("response data: ", data)
    return data.data;
  },

  getById: async (campaignId: string, batchId: string): Promise<LeadBatch> => {
    const { data } = await axios.get(
      `${BASE}/${campaignId}/batches/${batchId}`,
    );
    return data.data;
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

    const { data } = await axios.post(
      `${BASE}/${campaignId}/batches`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  run: async (
    campaignId: string,
    batchId: string,
  ): Promise<{ batch: LeadBatch; message: string }> => {
    const { data } = await axios.post(
      `${BASE}/${campaignId}/batches/${batchId}/run`,
    );
    return data.data;
  },

  schedule: async (
    campaignId: string,
    batchId: string,
    scheduledAt: string,
  ): Promise<{ batch: LeadBatch; message: string }> => {
    const { data } = await axios.post(
      `${BASE}/${campaignId}/batches/${batchId}/schedule`,
      { scheduledAt },
    );
    return data.data;
  },

  stop: async (
    campaignId: string,
    batchId: string,
  ): Promise<{ batch: LeadBatch; warning: string }> => {
    const { data } = await axios.post(
      `${BASE}/${campaignId}/batches/${batchId}/stop`,
    );
    return data.data;
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
    const { data } = await axios.post(
      `${BASE}/${campaignId}/batches/${batchId}/resume`,
    );
    return data.data;
  },

  delete: async (
    campaignId: string,
    batchId: string,
  ): Promise<{ message: string }> => {
    const { data } = await axios.delete(
      `${BASE}/${campaignId}/batches/${batchId}`,
    );
    return data.data;
  },

  getStats: async (
    campaignId: string,
    batchId: string,
  ): Promise<BatchStats> => {
    const { data } = await axios.get(
      `${BASE}/${campaignId}/batches/${batchId}/stats`,
    );
    return data.data;
  },
};
