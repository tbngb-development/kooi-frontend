import apiClient from "@/lib/axios";
import { ASSISTANT_ENDPOINTS } from "@/constants/api-routes/assistant-endpoint";
import type { ApiResponse } from "@/types/api";
import type { Assistant, AssistantDetail } from "@/types/assistant";

/**
 * Tenant read-only Assistant queries.
 * Backend module: `modules/assistants` (tenant routes).
 */
export const assistantsApi = {
  getAll: async (): Promise<Assistant[]> => {
    const res = await apiClient.get<ApiResponse<Assistant[]>>(
      ASSISTANT_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistants");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<AssistantDetail> => {
    const res = await apiClient.get<ApiResponse<AssistantDetail>>(
      ASSISTANT_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistant details");
    }
    return res.data.data;
  },
};
