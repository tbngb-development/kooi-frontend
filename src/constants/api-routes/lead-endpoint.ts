import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant Lead Query endpoints.
 * Backend module: `modules/leads/presentation/buildLeadRoutes`
 */
export const LEAD_ENDPOINTS = {
  BASE: `${API_PREFIXES.TENANT}/leads`,
  BY_ID: (id: string) => `${API_PREFIXES.TENANT}/leads/${id}`,
  STATS: `${API_PREFIXES.TENANT}/leads/stats`,
} as const;