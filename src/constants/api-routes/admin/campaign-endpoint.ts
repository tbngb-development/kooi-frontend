import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_CAMPAIGN_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/campaigns`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/campaigns/${id}`,
  STATS: (id: string) => `${API_PREFIXES.ADMIN}/campaigns/${id}/stats`,
  PERFORMANCE: (id: string) => `${API_PREFIXES.ADMIN}/campaigns/${id}/performance`,
} as const;