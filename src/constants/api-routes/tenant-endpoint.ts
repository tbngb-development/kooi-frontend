import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant-scoped workspace routes.
 * Backend module: `modules/tenants/presentation/buildTenantRoutes`
 */
export const TENANT_ENDPOINTS = {
  CURRENT: `${API_PREFIXES.TENANT}/tenants/current`,
  CURRENT_STATS: `${API_PREFIXES.TENANT}/tenants/current/stats`,
} as const;
