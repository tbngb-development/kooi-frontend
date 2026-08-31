import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Platform administrative routes for cross-tenant management.
 * Backend module: `modules/tenants/presentation/buildAdminTenantRoutes`
 */
export const ADMIN_TENANT_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/tenants`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/tenants/${id}`,
  STATS: (id: string) => `${API_PREFIXES.ADMIN}/tenants/${id}/stats`,
} as const;