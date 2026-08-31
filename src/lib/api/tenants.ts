import apiClient from "@/lib/axios";
import { TENANT_ENDPOINTS } from "@/constants/api-routes/tenant-endpoint";
import type { ApiResponse } from "@/types/api";
import type { Tenant, TenantStats } from "@/types/tenant";

/**
 * Tenant workspace operations.
 * Backend module: `modules/tenants` (tenant routes).
 */
export const tenantsApi = {
  getCurrent: async (): Promise<Tenant> => {
    const res = await apiClient.get<ApiResponse<Tenant>>(
      TENANT_ENDPOINTS.CURRENT,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch workspace details");
    }
    return res.data.data;
  },

  updateCurrent: async (data: { name: string }): Promise<Tenant> => {
    const res = await apiClient.patch<ApiResponse<Tenant>>(
      TENANT_ENDPOINTS.CURRENT,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update workspace name");
    }
    return res.data.data;
  },

  getCurrentStats: async (): Promise<TenantStats> => {
    const res = await apiClient.get<ApiResponse<TenantStats>>(
      TENANT_ENDPOINTS.CURRENT_STATS,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch workspace stats");
    }
    return res.data.data;
  },
};
