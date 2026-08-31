import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Tenant, TenantStats } from "@/types/tenant";

const TENANT_BASE = "/api/v1/tenants";
const ADMIN_BASE = "/api/v1/admin/tenants";

export const tenantsApi = {
  // ─── Tenant Workspace (Active JWT Scoped) ─────────────────────────────────

  getCurrent: async (): Promise<Tenant> => {
    const res = await apiClient.get<ApiResponse<Tenant>>(
      `${TENANT_BASE}/current`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch workspace details");
    }
    return res.data.data;
  },

  updateCurrent: async (data: { name: string }): Promise<Tenant> => {
    const res = await apiClient.patch<ApiResponse<Tenant>>(
      `${TENANT_BASE}/current`,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update workspace name");
    }
    return res.data.data;
  },

  getCurrentStats: async (): Promise<TenantStats> => {
    const res = await apiClient.get<ApiResponse<TenantStats>>(
      `${TENANT_BASE}/current/stats`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch workspace stats");
    }
    return res.data.data;
  },

  // ─── Platform Admin (Targeted by ID) ──────────────────────────────────────

  adminGetAll: async (): Promise<Tenant[]> => {
    const res = await apiClient.get<ApiResponse<Tenant[]>>(ADMIN_BASE);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenants");
    }
    return res.data.data;
  },

  adminGetById: async (id: string): Promise<Tenant> => {
    const res = await apiClient.get<ApiResponse<Tenant>>(`${ADMIN_BASE}/${id}`);
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
      `${ADMIN_BASE}/${id}`,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update tenant");
    }
    return res.data.data;
  },

  adminGetStats: async (id: string): Promise<TenantStats> => {
    const res = await apiClient.get<ApiResponse<TenantStats>>(
      `${ADMIN_BASE}/${id}/stats`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenant stats");
    }
    return res.data.data;
  },
};
