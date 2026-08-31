import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_CALL_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/calls`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/calls/${id}`,
  TRANSCRIPT: (id: string) => `${API_PREFIXES.ADMIN}/calls/${id}/transcript`,
  STATS: `${API_PREFIXES.ADMIN}/calls/stats`,
} as const;
