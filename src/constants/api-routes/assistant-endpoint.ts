import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant workspace Assistant endpoints (Read-only).
 * Backend module: `modules/assistants/presentation/buildTenantRoutes`
 */
export const ASSISTANT_ENDPOINTS = {
  BASE: `${API_PREFIXES.TENANT}/assistants`,
  BY_ID: (id: string) => `${API_PREFIXES.TENANT}/assistants/${id}`,
} as const;