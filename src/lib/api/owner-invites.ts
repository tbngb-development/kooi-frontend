import apiClient from "@/lib/axios";
import { OWNER_INVITE_ENDPOINTS } from "@/constants/api-routes/owner-invite-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  PublicInviteView,
  AcceptOwnerInviteInput,
  AcceptOwnerInviteResponse,
} from "@/types/invite";

export const ownerInvitesApi = {
  getByToken: async (token: string): Promise<PublicInviteView> => {
    const res = await apiClient.get<ApiResponse<PublicInviteView>>(
      OWNER_INVITE_ENDPOINTS.BY_TOKEN(token),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to load invite");
    }
    return res.data.data;
  },

  accept: async (
    input: AcceptOwnerInviteInput,
  ): Promise<AcceptOwnerInviteResponse> => {
    const res = await apiClient.post<ApiResponse<AcceptOwnerInviteResponse>>(
      OWNER_INVITE_ENDPOINTS.ACCEPT,
      input,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to accept invite");
    }
    return res.data.data;
  },
};
