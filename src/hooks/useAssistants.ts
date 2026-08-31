"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assistantsApi } from "@/lib/api/assistants";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import type { RegisterAssistantInput, UpdateAssistantInput } from "@/types/assistant";

const ASSISTANTS_KEY = ["assistants"] as const;

// ─── Tenant Read-Only Hooks ──────────────────────────────────────────────────

export function useAssistants() {
  return useQuery({
    queryKey: ASSISTANTS_KEY,
    queryFn: assistantsApi.getAll,
  });
}

export function useAssistant(id: string | null | undefined) {
  return useQuery({
    queryKey: [...ASSISTANTS_KEY, id],
    queryFn: () => assistantsApi.getById(id as string),
    enabled: Boolean(id),
  });
}

// ─── Platform Admin Hooks ────────────────────────────────────────────────────

// Admin: Query agents directly from Bolna dashboard
export function useAdminBolnaAgents() {
  return useQuery({
    queryKey: [...ASSISTANTS_KEY, "admin", "bolna-agents"],
    queryFn: assistantsApi.listBolnaAgents,
  });
}

// Admin: Query assistants assigned to a specific tenant
export function useAdminAssistants(tenantId: string) {
  return useQuery({
    queryKey: [...ASSISTANTS_KEY, "admin", tenantId],
    queryFn: () => assistantsApi.adminGetAll(tenantId),
    enabled: !!tenantId,
  });
}

export function useAdminRegisterAssistant(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterAssistantInput) =>
      assistantsApi.adminRegister({ ...data, tenantId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...ASSISTANTS_KEY, "admin", tenantId],
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
      assistantsApi.adminUpdate(id, { ...data, tenantId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...ASSISTANTS_KEY, "admin", tenantId],
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
    mutationFn: () => assistantsApi.adminSync(tenantId, id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...ASSISTANTS_KEY, "admin", tenantId],
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
    mutationFn: (id: string) => assistantsApi.adminDelete(tenantId, id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...ASSISTANTS_KEY, "admin", tenantId],
      });
      toast.success("Assistant assignment revoked");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
