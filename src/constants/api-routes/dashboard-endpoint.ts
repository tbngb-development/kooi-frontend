import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant Analytics Dashboard overview feeds.
 * Backend module: `modules/dashboard/presentation/buildDashboardRoutes`
 */
export const DASHBOARD_ENDPOINTS = {
  OVERVIEW: `${API_PREFIXES.TENANT}/dashboard/overview`,
  ACTIVITY: `${API_PREFIXES.TENANT}/dashboard/activity`,
  CAMPAIGNS: `${API_PREFIXES.TENANT}/dashboard/campaigns`,
} as const;
