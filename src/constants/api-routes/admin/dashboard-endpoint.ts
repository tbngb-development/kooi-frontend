import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_DASHBOARD_ENDPOINTS = {
  OVERVIEW: `${API_PREFIXES.ADMIN}/dashboard/overview`,
  TENANTS_HEALTH: `${API_PREFIXES.ADMIN}/dashboard/tenants-health`,
  ACTIVITY: `${API_PREFIXES.ADMIN}/dashboard/activity`,
} as const;
