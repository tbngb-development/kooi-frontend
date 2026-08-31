import apiClient from "@/lib/axios";
import { USER_ENDPOINTS } from "@/constants/api-routes/user-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  CreateUserInput,
  TeamMember,
  UpdateUserInput,
} from "@/types/user";

/**
 * Workspace member administration.
 * Backend module: `modules/users` (tenant routes).
 */
export const usersApi = {
  getAll: async (): Promise<TeamMember[]> => {
    const res = await apiClient.get<ApiResponse<TeamMember[]>>(
      USER_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch users");
    }
    return res.data.data;
  },

  create: async (data: CreateUserInput): Promise<TeamMember> => {
    const res = await apiClient.post<ApiResponse<TeamMember>>(
      USER_ENDPOINTS.BASE,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create user");
    }
    return res.data.data;
  },

  update: async (id: string, data: UpdateUserInput): Promise<TeamMember> => {
    const res = await apiClient.patch<ApiResponse<TeamMember>>(
      USER_ENDPOINTS.BY_ID(id),
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update user");
    }
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      USER_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete user");
    }
  },
};
