import { API_PREFIXES } from "@/constants/config/api-prefix";

export const PLAN_ENDPOINTS = {
  AVAILABLE: `${API_PREFIXES.TENANT}/plans/available`,
  MINE: `${API_PREFIXES.TENANT}/plans/mine`,
} as const;
