// src/lib/api/assistants.ts

import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Assistant,
  AssistantDetail,
  BolnaAgent,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types";

export const assistantsApi = {
  // ── Tenant user: all assistants scoped by JWT ─────────────────────────────
  // Backend reads tenantId from req.user (JWT) automatically
  getAll: async (): Promise<Assistant[]> => {
    const res =
      await apiClient.get<ApiResponse<Assistant[]>>("/api/assistants");
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistants");
    }
    return res.data.data;
  },

  // ── Admin: all assistants for a specific tenant ───────────────────────────
  // Backend resolveTenantId reads from query param when role=SUPER_ADMIN
  getAllByTenant: async (tenantId: string): Promise<Assistant[]> => {
    const res = await apiClient.get<ApiResponse<Assistant[]>>(
      "/api/assistants",
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistants");
    }
    return res.data.data;
  },

  // ── Single assistant with extracted prompt variables ──────────────────────
  // Backend resolveTenantId from JWT (tenant user)
  getById: async (id: string): Promise<AssistantDetail> => {
    const res = await apiClient.get<ApiResponse<AssistantDetail>>(
      `/api/assistants/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistant");
    }
    return res.data.data;
  },

  // ── Tenant user: register assistant (tenantId from JWT) ───────────────────
  register: async (data: RegisterAssistantInput): Promise<Assistant> => {
    const res = await apiClient.post<ApiResponse<Assistant>>(
      "/api/assistants/register",
      data, // { name, bolnaId } — backend uses JWT tenantId
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to register assistant");
    }
    return res.data.data;
  },

  // ── Admin: register assistant with explicit tenantId in body ──────────────
  // Backend resolveTenantId reads bodyTenantId when role=SUPER_ADMIN
  adminRegister: async (
    data: RegisterAssistantInput & { tenantId: string },
  ): Promise<Assistant> => {
    const res = await apiClient.post<ApiResponse<Assistant>>(
      "/api/assistants/register",
      data, // { name, bolnaId, tenantId }
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to register assistant");
    }
    return res.data.data;
  },

  // ── Tenant user: update assistant name (tenantId from JWT) ────────────────
  update: async (
    id: string,
    data: UpdateAssistantInput,
  ): Promise<Assistant> => {
    const res = await apiClient.patch<ApiResponse<Assistant>>(
      `/api/assistants/${id}`,
      data, // { name }
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update assistant");
    }
    return res.data.data;
  },

  // ── Admin: update assistant name with explicit tenantId in body ───────────
  // Backend resolveTenantId reads bodyTenantId when role=SUPER_ADMIN
  adminUpdate: async (
    id: string,
    data: UpdateAssistantInput & { tenantId: string },
  ): Promise<Assistant> => {
    const res = await apiClient.patch<ApiResponse<Assistant>>(
      `/api/assistants/${id}`,
      data, // { name, tenantId }
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update assistant");
    }
    return res.data.data;
  },

  // ── Tenant user: delete assistant (tenantId from JWT) ─────────────────────
  delete: async (id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/api/assistants/${id}`,
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete assistant");
    }
  },

  // ── Admin: delete assistant with explicit tenantId in body ────────────────
  // axios delete with body → { data: { tenantId } }
  // Backend resolveTenantId reads req.body.tenantId when role=SUPER_ADMIN
  adminDelete: async (id: string, tenantId: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/api/assistants/${id}`,
      { data: { tenantId } }, // axios passes this as request body for DELETE
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete assistant");
    }
  },

  // ── Fetch all agents from Bolna dashboard ─────────────────────────────────
  listBolnaAgents: async (): Promise<BolnaAgent[]> => {
    const res = await apiClient.get<ApiResponse<BolnaAgent[]>>(
      "/api/assistants/bolna-agents",
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch Bolna agents");
    }
    return res.data.data;
  },
};
