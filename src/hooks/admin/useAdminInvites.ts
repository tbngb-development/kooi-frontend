"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminInvitesApi } from "@/lib/api/admin/admin-invites";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { CreateOwnerInviteInput } from "@/types/invite";

export function useAdminInvites() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_INVITES.all,
    queryFn: adminInvitesApi.getAll,
  });
}

export function useCreateOwnerInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOwnerInviteInput) => adminInvitesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_INVITES.all });
      toast.success("Invite sent successfully");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useResendAdminInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminInvitesApi.resend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_INVITES.all });
      toast.success("Invitation email sent successfully");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useRevokeAdminInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminInvitesApi.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_INVITES.all });
      toast.success("Invitation successfully revoked");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
