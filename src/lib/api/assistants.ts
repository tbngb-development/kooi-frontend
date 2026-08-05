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
  // ── All registered assistants ─────────────────────────────────────────────
  getAll: async (): Promise<Assistant[]> => {
    const res =
      await apiClient.get<ApiResponse<Assistant[]>>("/api/assistants");
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistants");
    }
    return res.data.data;
  },

  // ── Single assistant with extracted prompt variables ──────────────────────
  // Backend returns { assistant, variables } — always fresh from Bolna
  getById: async (id: string): Promise<AssistantDetail> => {
    const res = await apiClient.get<ApiResponse<AssistantDetail>>(
      `/api/assistants/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch assistant");
    }
    return res.data.data;
  },

  // ── Register by Bolna agent ID ────────────────────────────────────────────
  register: async (data: RegisterAssistantInput): Promise<Assistant> => {
    const res = await apiClient.post<ApiResponse<Assistant>>(
      "/api/assistants/register",
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to register assistant");
    }
    return res.data.data;
  },

  // ── Update friendly name only ─────────────────────────────────────────────
  update: async (
    id: string,
    data: UpdateAssistantInput,
  ): Promise<Assistant> => {
    const res = await apiClient.patch<ApiResponse<Assistant>>(
      `/api/assistants/${id}`,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update assistant");
    }
    return res.data.data;
  },

  // ── Remove from system only ───────────────────────────────────────────────
  delete: async (id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/api/assistants/${id}`,
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
