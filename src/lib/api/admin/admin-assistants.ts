import apiClient from "@/lib/axios";
import { ADMIN_ASSISTANT_ENDPOINTS } from "@/constants/api-routes/admin/assistant-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Assistant,
  AssistantDetail,
  BolnaAgent,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types/assistant";

/**
 * Platform administrative Assistant operations (requires isPlatformAdmin).
 */
export const adminAssistantsApi = {
  listBolnaAgents: async (): Promise<BolnaAgent[]> => {
    const res = await apiClient.get<ApiResponse<BolnaAgent[]>>(
      ADMIN_ASSISTANT_ENDPOINTS.BOLNA_AGENTS,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to retrieve Bolna agents");
    }
    return res.data.data;
  },

  adminGetAll: async (tenantId: string): Promise<Assistant[]> => {
    const res = await apiClient.get<ApiResponse<Assistant[]>>(
      ADMIN_ASSISTANT_ENDPOINTS.BASE,
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenant assistants");
    }
    return res.data.data;
  },

  adminGetById: async (
    tenantId: string,
    id: string,
  ): Promise<AssistantDetail> => {
    const res = await apiClient.get<ApiResponse<AssistantDetail>>(
      ADMIN_ASSISTANT_ENDPOINTS.BY_ID(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistant details");
    }
    return res.data.data;
  },

  adminRegister: async (
    data: RegisterAssistantInput & { tenantId: string },
  ): Promise<Assistant> => {
    const res = await apiClient.post<ApiResponse<Assistant>>(
      ADMIN_ASSISTANT_ENDPOINTS.REGISTER,
      data,
      { params: { tenantId: data.tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to register assistant");
    }
    return res.data.data;
  },

  adminUpdate: async (
    id: string,
    data: UpdateAssistantInput & { tenantId: string },
  ): Promise<Assistant> => {
    const res = await apiClient.patch<ApiResponse<Assistant>>(
      ADMIN_ASSISTANT_ENDPOINTS.BY_ID(id),
      data,
      { params: { tenantId: data.tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update assistant");
    }
    return res.data.data;
  },

  adminSync: async (tenantId: string, id: string): Promise<Assistant> => {
    const res = await apiClient.post<ApiResponse<Assistant>>(
      ADMIN_ASSISTANT_ENDPOINTS.SYNC(id),
      {},
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to sync assistant with Bolna");
    }
    return res.data.data;
  },

  adminDelete: async (tenantId: string, id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      ADMIN_ASSISTANT_ENDPOINTS.BY_ID(id),
      { params: { tenantId } },
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete assistant");
    }
  },
};
