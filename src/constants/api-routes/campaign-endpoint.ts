import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant campaign manager endpoints.
 * Backend module: `modules/campaigns/presentation/buildCampaignRoutes`
 */
export const CAMPAIGN_ENDPOINTS = {
  BASE: `${API_PREFIXES.TENANT}/campaigns`,
  BY_ID: (id: string) => `${API_PREFIXES.TENANT}/campaigns/${id}`,
  STATS: (id: string) => `${API_PREFIXES.TENANT}/campaigns/${id}/stats`,
  PERFORMANCE: (id: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${id}/performance`,
  PARSE_LEADS: (id: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${id}/parse-leads`,
} as const;
