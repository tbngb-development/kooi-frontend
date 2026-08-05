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

// ── All registered assistants ─────────────────────────────────────────────────
export function useAssistants() {
  return useQuery({
    queryKey: ASSISTANTS_KEY,
    queryFn: assistantsApi.getAll,
  });
}

// ── Single assistant with prompt variables ────────────────────────────────────
// Accepts string | null — only fetches when id is a non-empty string
// Used in campaign creation step 2 after user selects an assistant
export function useAssistant(id: string | null) {
  return useQuery<AssistantDetail>({
    queryKey: [...ASSISTANTS_KEY, id],
    queryFn: () => assistantsApi.getById(id!),
    enabled: Boolean(id),
    // Variables come from Bolna live — stale after 5 minutes
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

// ── Register by Bolna agent ID ────────────────────────────────────────────────
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

// ── Update friendly name ──────────────────────────────────────────────────────
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

// ── Delete ────────────────────────────────────────────────────────────────────
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
