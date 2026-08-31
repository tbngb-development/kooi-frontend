import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_BATCH_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/batches`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/batches/${id}`,
  STATS: (id: string) => `${API_PREFIXES.ADMIN}/batches/${id}/stats`,
} as const;
