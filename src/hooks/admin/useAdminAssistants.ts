"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminAssistantsApi } from "@/lib/api/admin/admin-assistants";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type {
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types/assistant";

export function useAdminBolnaAgents() {
  return useQuery({
    queryKey: QUERY_KEYS.ASSISTANTS.bolnaAgents,
    queryFn: adminAssistantsApi.listBolnaAgents,
  });
}

export function useAdminAssistants(tenantId: string) {
  const isTenantValid = Boolean(tenantId) && tenantId !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
    queryFn: () => adminAssistantsApi.adminGetAll(tenantId),
    enabled: isTenantValid,
  });
}

export function useAdminRegisterAssistant(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterAssistantInput) =>
      adminAssistantsApi.adminRegister({ ...data, tenantId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
      });
      toast.success("Assistant registered and assigned successfully");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useAdminUpdateAssistant(id: string, tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAssistantInput) =>
      adminAssistantsApi.adminUpdate(id, { ...data, tenantId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
      });
      toast.success("Assistant display name updated");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useAdminSyncAssistant(id: string, tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminAssistantsApi.adminSync(tenantId, id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
      });
      toast.success("Synchronized successfully with Bolna configuration");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useAdminDeleteAssistant(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAssistantsApi.adminDelete(tenantId, id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
      });
      toast.success("Assistant assignment revoked");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
