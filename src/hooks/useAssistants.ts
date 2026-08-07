// src/hooks/useAssistants.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assistantsApi } from "@/lib/api/assistants";
import type {
  AssistantDetail,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types";

export const ASSISTANTS_KEY = ["assistants"] as const;
export const BOLNA_AGENTS_KEY = ["bolna-agents"] as const;

// ── All registered assistants (tenant-scoped via JWT) ────────────────────────
export function useAssistants() {
  return useQuery({
    queryKey: ASSISTANTS_KEY,
    queryFn: assistantsApi.getAll,
  });
}

// ── Admin: all assistants for a specific tenant ───────────────────────────────
export function useAdminAssistants(tenantId: string) {
  return useQuery({
    queryKey: [...ASSISTANTS_KEY, "tenant", tenantId],
    queryFn: () => assistantsApi.getAllByTenant(tenantId),
    enabled: Boolean(tenantId),
  });
}

// ── Single assistant with prompt variables ────────────────────────────────────
export function useAssistant(id: string | null) {
  return useQuery<AssistantDetail>({
    queryKey: [...ASSISTANTS_KEY, id],
    queryFn: () => assistantsApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Bolna dashboard agents (for registration dropdown) ────────────────────────
export function useBolnaAgents() {
  return useQuery({
    queryKey: BOLNA_AGENTS_KEY,
    queryFn: assistantsApi.listBolnaAgents,
    staleTime: 30_000,
  });
}

// ── Register by Bolna agent ID (tenant user) ─────────────────────────────────
export function useRegisterAssistant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterAssistantInput) => assistantsApi.register(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ASSISTANTS_KEY });
      toast.success("Assistant registered successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Admin: register assistant for a specific tenant ───────────────────────────
export function useAdminRegisterAssistant(tenantId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterAssistantInput) =>
      assistantsApi.adminRegister({ ...data, tenantId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...ASSISTANTS_KEY, "tenant", tenantId],
      });
      toast.success("Assistant registered successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Update friendly name (tenant user) ───────────────────────────────────────
export function useUpdateAssistant(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAssistantInput) => assistantsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ASSISTANTS_KEY });
      toast.success("Assistant updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Admin: update assistant for a specific tenant ─────────────────────────────
export function useAdminUpdateAssistant(id: string, tenantId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAssistantInput) =>
      assistantsApi.adminUpdate(id, { ...data, tenantId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...ASSISTANTS_KEY, "tenant", tenantId],
      });
      toast.success("Assistant updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Delete (tenant user) ──────────────────────────────────────────────────────
export function useDeleteAssistant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assistantsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ASSISTANTS_KEY });
      toast.success("Assistant removed from system");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Admin: delete assistant for a specific tenant ─────────────────────────────
export function useAdminDeleteAssistant(tenantId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assistantsApi.adminDelete(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...ASSISTANTS_KEY, "tenant", tenantId],
      });
      toast.success("Assistant removed from system");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
