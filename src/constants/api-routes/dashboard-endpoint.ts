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
  CAMPAIGN_PERFORMANCE: `${BASE}/campaign-performance`,
  TOP_CAMPAIGNS: `${BASE}/top-campaigns`,
  RECENT_ACTIVITY: `${BASE}/recent-activity`,
  EXPORT_CAMPAIGN_PERFORMANCE: `${BASE}/export/campaign-performance`,
  EXPORT_CALL_TRENDS: `${BASE}/export/call-trends`,
} as const;
