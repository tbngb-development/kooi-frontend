import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { CreateUserInput, TeamMember, UpdateUserInput } from '@/types/user';

// V1: Workspace users management API mapped to /api/v1/users
export const usersApi = {
  getAll: async (): Promise<TeamMember[]> => {
    const res = await apiClient.get<ApiResponse<TeamMember[]>>('/api/v1/users');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to fetch users');
    }
    return res.data.data;
  },

  create: async (data: CreateUserInput): Promise<TeamMember> => {
    const res = await apiClient.post<ApiResponse<TeamMember>>('/api/v1/users', data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to create user');
    }
    return res.data.data;
  },

  update: async (id: string, data: UpdateUserInput): Promise<TeamMember> => {
    const res = await apiClient.patch<ApiResponse<TeamMember>>(
      `/api/v1/users/${id}`,
      data
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? 'Failed to update user');
    }
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/api/v1/users/${id}`);
    if (!res.data.success) {
      throw new Error(res.data.error ?? 'Failed to delete user');
    }
  },
};