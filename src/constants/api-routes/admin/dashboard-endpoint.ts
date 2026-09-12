import { API_PREFIXES } from "@/constants/config/api-prefix";

const BASE = `${API_PREFIXES.ADMIN}/dashboard`;

export const ADMIN_DASHBOARD_ENDPOINTS = {
  OVERVIEW: `${BASE}/overview`,
  REVENUE_TRENDS: `${BASE}/revenue-trends`,
  CALL_VOLUME_TRENDS: `${BASE}/call-volume-trends`,
  TENANT_DISTRIBUTION: `${BASE}/tenant-distribution`,
  TOP_TENANTS: `${BASE}/top-tenants`,
} as const;