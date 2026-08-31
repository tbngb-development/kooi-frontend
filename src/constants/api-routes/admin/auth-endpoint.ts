import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIXES.ADMIN}/auth/login`,
  LOGOUT: `${API_PREFIXES.ADMIN}/auth/logout`,
  REFRESH: `${API_PREFIXES.ADMIN}/auth/refresh`,
} as const;