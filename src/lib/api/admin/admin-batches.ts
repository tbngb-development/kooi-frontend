import apiClient from "@/lib/axios";
import { ADMIN_BATCH_ENDPOINTS } from "@/constants/api-routes/admin/batch-endpoint";
import type { ApiResponse } from "@/types/api";
import type { LeadBatch, BatchStats } from "@/types/batch";

export const adminBatchesApi = {
  getAll: async (
    tenantId: string,
    campaignId: string,
  ): Promise<LeadBatch[]> => {
    if (
      !tenantId ||
      !campaignId ||
      tenantId === "undefined" ||
      campaignId === "undefined"
    ) {
      return [];
    }
    const res = await apiClient.get<ApiResponse<LeadBatch[]>>(
      ADMIN_BATCH_ENDPOINTS.BASE,
      { params: { tenantId, campaignId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batches");
    }
    return res.data.data;
  },

  getById: async (
    tenantId: string,
    campaignId: string,
    id: string,
  ): Promise<LeadBatch> => {
    if (
      !tenantId ||
      !campaignId ||
      !id ||
      tenantId === "undefined" ||
      campaignId === "undefined" ||
      id === "undefined"
    ) {
      throw new Error("tenantId, campaignId, and batchId are required");
    }
    const res = await apiClient.get<ApiResponse<LeadBatch>>(
      ADMIN_BATCH_ENDPOINTS.BY_ID(id),
      { params: { tenantId, campaignId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batch");
    }
    return res.data.data;
  },

  getStats: async (
    tenantId: string,
    campaignId: string,
    id: string,
  ): Promise<BatchStats> => {
    if (
      !tenantId ||
      !campaignId ||
      !id ||
      tenantId === "undefined" ||
      campaignId === "undefined" ||
      id === "undefined"
    ) {
      throw new Error("tenantId, campaignId, and batchId are required");
    }
    const res = await apiClient.get<ApiResponse<BatchStats>>(
      ADMIN_BATCH_ENDPOINTS.STATS(id),
      { params: { tenantId, campaignId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch batch stats");
    }
    return res.data.data;
  },
};
