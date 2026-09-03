"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ownerInvitesApi } from "@/lib/api/owner-invites";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function usePublicInvite(token: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.OWNER_INVITE.public(token ?? ""),
    queryFn: () => ownerInvitesApi.getByToken(token!),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptOwnerInvite() {
  return useMutation({
    mutationFn: ownerInvitesApi.accept,
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
    