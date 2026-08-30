import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Assistant,
  AssistantDetail,
  BolnaAgent,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types";

const TENANT_BASE = "/api/v1/assistants";
const ADMIN_BASE = "/api/v1/admin/assistants";

export const assistantsApi = {
  // ─── Tenant Read-Only (Workspace users) ───────────────────────────────────

  getAll: async (): Promise<Assistant[]> => {
    const res = await apiClient.get<ApiResponse<Assistant[]>>(TENANT_BASE);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistants");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<AssistantDetail> => {
    const res = await apiClient.get<ApiResponse<AssistantDetail>>(
      `${TENANT_BASE}/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistant details");
    }
    return res.data.data;
  },

  // ─── Platform Admin Operations (Requires isPlatformAdmin) ─────────────────

  // Bolna agent registry dropdown is now under Admin Base
  listBolnaAgents: async (): Promise<BolnaAgent[]> => {
    const res = await apiClient.get<ApiResponse<BolnaAgent[]>>(
      `${ADMIN_BASE}/bolna-agents`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to retrieve Bolna agents");
    }
    return res.data.data;
  },

  adminGetAll: async (tenantId: string): Promise<Assistant[]> => {
    const res = await apiClient.get<ApiResponse<Assistant[]>>(ADMIN_BASE, {
      params: { tenantId },
    });
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
      `${ADMIN_BASE}/${id}`,
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
      `${ADMIN_BASE}/register`,
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
      `${ADMIN_BASE}/${id}`,
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
      `${ADMIN_BASE}/${id}/sync`,
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
      `${ADMIN_BASE}/${id}`,
      { params: { tenantId } },
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete assistant");
    }
  },
};
