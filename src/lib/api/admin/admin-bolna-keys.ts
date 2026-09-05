import apiClient from "@/lib/axios";
import { ADMIN_BOLNA_KEY_ENDPOINTS } from "@/constants/api-routes/admin/bolna-key-endpoint";
import type { ApiResponse } from "@/types/api";
import type { BolnaApiKey, CreateBolnaKeyInput } from "@/types/bolna-key";

export const adminBolnaKeysApi = {
  getAll: async (): Promise<BolnaApiKey[]> => {
    const res = await apiClient.get<ApiResponse<BolnaApiKey[]>>(
      ADMIN_BOLNA_KEY_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch Bolna API keys");
    }
    return res.data.data;
  },

  create: async (data: CreateBolnaKeyInput): Promise<BolnaApiKey> => {
    const res = await apiClient.post<ApiResponse<BolnaApiKey>>(
      ADMIN_BOLNA_KEY_ENDPOINTS.BASE,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create Bolna API key");
    }
    return res.data.data;
  },

  assignToTenant: async (
    id: string,
    tenantId: string,
  ): Promise<{ message: string }> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(
      ADMIN_BOLNA_KEY_ENDPOINTS.ASSIGN(id),
      { tenantId },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to assign key to tenant");
    }
    return res.data.data;
  },

  deactivate: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(
      ADMIN_BOLNA_KEY_ENDPOINTS.DEACTIVATE(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to deactivate key");
    }
    return res.data.data;
  },
};
