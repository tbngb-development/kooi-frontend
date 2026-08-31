import apiClient from "@/lib/axios";
import { ADMIN_TENANT_ENDPOINTS } from "@/constants/api-routes/admin/tenant-endpoint";
import type { ApiResponse } from "@/types/api";
import type { Tenant, TenantStats } from "@/types/tenant";

/**
 * Platform Admin tenants management API.
 * Backend module: `modules/tenants` (admin routes).
 */
export const adminTenantsApi = {
  adminGetAll: async (): Promise<Tenant[]> => {
    const res = await apiClient.get<ApiResponse<Tenant[]>>(
      ADMIN_TENANT_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenants");
    }
    return res.data.data;
  },

  adminGetById: async (id: string): Promise<Tenant> => {
    const res = await apiClient.get<ApiResponse<Tenant>>(
      ADMIN_TENANT_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenant");
    }
    return res.data.data;
  },

  adminUpdate: async (
    id: string,
    data: Partial<Pick<Tenant, "isActive" | "name">>,
  ): Promise<Tenant> => {
    const res = await apiClient.patch<ApiResponse<Tenant>>(
      ADMIN_TENANT_ENDPOINTS.BY_ID(id),
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update tenant");
    }
    return res.data.data;
  },

  adminGetStats: async (id: string): Promise<TenantStats> => {
    const res = await apiClient.get<ApiResponse<TenantStats>>(
      ADMIN_TENANT_ENDPOINTS.STATS(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenant stats");
    }
    return res.data.data;
  },
};
