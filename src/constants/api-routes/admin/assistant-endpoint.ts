import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Super Admin administrative Assistant endpoints.
 * Backend module: `modules/assistants/presentation/buildAdminAssistantRoutes`
 */
export const ADMIN_ASSISTANT_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/assistants`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/assistants/${id}`,
  SYNC: (id: string) => `${API_PREFIXES.ADMIN}/assistants/${id}/sync`,
  REGISTER: `${API_PREFIXES.ADMIN}/assistants/register`,
  BOLNA_AGENTS: `${API_PREFIXES.ADMIN}/assistants/bolna-agents`,
} as const;
