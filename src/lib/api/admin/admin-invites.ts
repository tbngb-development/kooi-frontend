import apiClient from "@/lib/axios";
import { ADMIN_INVITE_ENDPOINTS } from "@/constants/api-routes/admin/invite-endpoint";
import type { ApiResponse } from "@/types/api";
import type { CreateOwnerInviteInput, OwnerInvite } from "@/types/invite";

export const adminInvitesApi = {
  create: async (input: CreateOwnerInviteInput): Promise<OwnerInvite> => {
    const res = await apiClient.post<ApiResponse<OwnerInvite>>(
      ADMIN_INVITE_ENDPOINTS.BASE,
      input,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create owner invite");
    }
    return res.data.data;
  },

  getAll: async (): Promise<OwnerInvite[]> => {
    const res = await apiClient.get<ApiResponse<OwnerInvite[]>>(
      ADMIN_INVITE_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch invites");
    }
    return res.data.data;
  },
};
