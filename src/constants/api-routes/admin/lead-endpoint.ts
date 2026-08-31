import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_LEAD_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/leads`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/leads/${id}`,
  STATS: `${API_PREFIXES.ADMIN}/leads/stats`,
} as const;
