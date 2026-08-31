"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { campaignsApi } from "@/lib/api/campaigns";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type {
  CampaignPerformance,
  CreateCampaignInput,
  ParseLeadsResult,
  UpdateCampaignInput,
} from "@/types/campaign";

/**
 * Tenant Campaign Manager hooks.
 * V1: Polling parameters are set to false by default to prevent client-side rate limits.
 */

export function useCampaigns() {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGNS.all,
    queryFn: campaignsApi.getAll,
  });
}

export function useCampaign(id: string, pollWhileRunning = false) {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGNS.detail(id),
    queryFn: () => campaignsApi.getById(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!pollWhileRunning) return false;
      const status = query.state.data?.status;
      return status === "RUNNING" ? 15000 : false; // Safe 15s interval fallback
    },
  });
}

export function useCampaignStats(id: string, pollWhileRunning = false) {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGNS.stats(id),
    queryFn: () => campaignsApi.getStats(id),
    enabled: Boolean(id),
    refetchInterval: () => (pollWhileRunning ? 15000 : false),
  });
}

export function useCampaignPerformance(id: string, enabled = true) {
  return useQuery<CampaignPerformance>({
    queryKey: QUERY_KEYS.CAMPAIGNS.performance(id),
    queryFn: () => campaignsApi.getCampaignPerformance(id),
    enabled: enabled && !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignInput) => campaignsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS.all });
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
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CAMPAIGNS.detail(id) });
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
