import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_PLAN_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/plans`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/plans/${id}`,
} as const;
