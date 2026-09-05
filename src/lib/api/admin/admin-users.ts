import apiClient from "@/lib/axios";
import { ADMIN_USER_ENDPOINTS } from "@/constants/api-routes/admin/user-endpoint";
import type { ApiResponse } from "@/types/api";
import type { AdminUsersPage, AdminUser } from "@/types/user";

export const adminUsersApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<AdminUsersPage> => {
    const res = await apiClient.get<ApiResponse<any>>(
      ADMIN_USER_ENDPOINTS.BASE,
      { params },
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch admin users");
    }

    const payload = res.data.data;

    // Normalization across different backend response pagination structures
    if (Array.isArray(payload)) {
      return {
        items: payload,
        total: payload.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? payload.length,
      };
    }

    if (Array.isArray(payload.users)) {
      return {
        items: payload.users,
        total:
          payload.pagination?.total ?? payload.total ?? payload.users.length,
        page: payload.pagination?.page ?? params?.page ?? 1,
        limit: payload.pagination?.limit ?? params?.limit ?? 20,
      };
    }

    if (Array.isArray(payload.items)) {
      return {
        items: payload.items,
        total: payload.total ?? payload.items.length,
        page: payload.page ?? params?.page ?? 1,
        limit: payload.limit ?? params?.limit ?? 20,
      };
    }

    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  },

  setActive: async (id: string, isActive: boolean): Promise<AdminUser> => {
    const res = await apiClient.patch<ApiResponse<AdminUser>>(
      ADMIN_USER_ENDPOINTS.ACTIVE(id),
      { isActive },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to change user status");
    }
    return res.data.data;
  },
};
