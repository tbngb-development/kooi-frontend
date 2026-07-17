// src/hooks/useCampaigns.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { campaignsApi } from "@/lib/api/campaigns";
import type { CreateCampaignInput, UpdateCampaignInput } from "@/types";

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
    refetchInterval: (query) => {
      if (!pollWhileRunning) return false;
      // Re-poll based on parent campaign query — default polling when enabled
      return pollWhileRunning ? 5000 : false;
    },
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
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCampaignInput) => campaignsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success("Campaign updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUploadCSV(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => campaignsApi.uploadCSV(campaignId, file),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, campaignId] });
      console.log("upload csv result: ", result);
      const imported = result.total - result.invalid;

      toast.success(
        `Successfully imported ${imported} lead${imported !== 1 ? "s" : ""}${
          result.invalid
            ? `. Skipped ${result.invalid} invalid row${result.invalid !== 1 ? "s" : ""}.`
            : "."
        }`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useStartCampaign(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => campaignsApi.start(campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success("Campaign started!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePauseCampaign(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => campaignsApi.pause(campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      toast.success("Campaign paused!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
