import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_USER_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/users`,
  ACTIVE: (id: string) => `${API_PREFIXES.ADMIN}/users/${id}/active` as const,
} as const;
