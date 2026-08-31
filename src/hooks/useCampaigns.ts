"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { campaignsApi } from "@/lib/api/campaigns";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import type {
  CampaignPerformance,
  CreateCampaignInput,
  ParseLeadsResult,
  UpdateCampaignInput,
} from "@/types/campaign";

export const CAMPAIGNS_KEY = ["campaigns"] as const;

export function useCampaigns() {
  return useQuery({
    queryKey: CAMPAIGNS_KEY,
    queryFn: campaignsApi.getAll,
  });
}

export function useCampaign(id: string, pollWhileRunning = false) {
  return useQuery({
    queryKey: [...CAMPAIGNS_KEY, id],
    queryFn: () => campaignsApi.getById(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!pollWhileRunning) return false;
      const status = query.state.data?.status;
      return status === "RUNNING" ? 5000 : false;
    },
  });
}

export function useCampaignStats(id: string, pollWhileRunning = false) {
  return useQuery({
    queryKey: [...CAMPAIGNS_KEY, id, "stats"],
    queryFn: () => campaignsApi.getStats(id),
    enabled: Boolean(id),
    refetchInterval: () => (pollWhileRunning ? 5000 : false),
  });
}

export function useCampaignPerformance(id: string, enabled = true) {
  return useQuery<CampaignPerformance>({
    queryKey: ["campaigns", id, "performance"],
    queryFn: () => campaignsApi.getCampaignPerformance(id),
    enabled: enabled && !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignInput) => campaignsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success("Campaign created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error));
    },
  });
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCampaignInput) => campaignsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      qc.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, id] });
      toast.success("Campaign updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error));
    },
  });
}

export function useParseCSV(campaignId: string) {
  return useMutation({
    mutationFn: (file: File): Promise<ParseLeadsResult> =>
      campaignsApi.parseCSV(campaignId, file),
    onError: (error: unknown) => {
      toast.error("Parse failed", { description: getAxiosErrorMessage(error) });
    },
  });
}

/*
 * ── V1 DEPRECATED HOOK STUBS ──────────────────────────────────────────────────
 * These stubs catch any remaining legacy components that haven't transitioned
 * to Batch hooks yet, safely guiding development toward BatchActions instead.
 */

/** @deprecated Use useCreateBatch from useBatches instead */
export function useUploadCSV() {
  return {
    mutate: () => {
      toast.error("Deprecated in V1. Use Batch Upload components instead.");
    },
    isPending: false,
  };
}

/** @deprecated Use useRunBatch from useBatches instead */
export function useStartCampaign() {
  return {
    mutate: () => {
      toast.error("Deprecated in V1. Use useRunBatch instead.");
    },
    isPending: false,
  };
}

/** @deprecated Use useStopBatch from useBatches instead */
export function usePauseCampaign() {
  return {
    mutate: () => {
      toast.error("Deprecated in V1. Use useStopBatch instead.");
    },
    isPending: false,
  };
}

/** @deprecated Use useStopBatch from useBatches instead */
export function useCancelScheduleCampaign() {
  return {
    mutate: () => {
      toast.error("Deprecated in V1. Use useStopBatch instead.");
    },
    isPending: false,
  };
}
