import { API_PREFIXES } from "@/constants/config/api-prefix";

const BASE = `${API_PREFIXES.TENANT}/dashboard`;

/**
 * Tenant Analytics Dashboard API endpoints.
 * See: docs/api/tenant-dashboard.md
 */
export const DASHBOARD_ENDPOINTS = {
  OVERVIEW: `${BASE}/overview`,
  CALL_TRENDS: `${BASE}/call-trends`,
  SPEND_TRENDS: `${BASE}/spend-trends`,
  LEAD_FUNNEL: `${BASE}/lead-funnel`,
  DISPOSITION_BREAKDOWN: `${BASE}/disposition-breakdown`,
  TEMPERATURE_DISTRIBUTION: `${BASE}/temperature-distribution`,
  TOP_CAMPAIGNS: `${BASE}/top-campaigns`,
  RECENT_ACTIVITY: `${BASE}/recent-activity`,
} as const;
