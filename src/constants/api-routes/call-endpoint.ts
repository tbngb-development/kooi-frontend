import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant Call Analysis and Audio Session endpoints.
 * Backend module: `modules/calls/presentation/buildCallRoutes`
 */
export const CALL_ENDPOINTS = {
  BASE: `${API_PREFIXES.TENANT}/calls`,
  BY_ID: (id: string) => `${API_PREFIXES.TENANT}/calls/${id}`,
  TRANSCRIPT: (id: string) => `${API_PREFIXES.TENANT}/calls/${id}/transcript`,
  STATS: `${API_PREFIXES.TENANT}/calls/stats`,
} as const;