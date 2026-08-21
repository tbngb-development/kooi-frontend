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

// ── UPDATED: Poll while status is RUNNING or SCHEDULED ──
export function useCampaign(id: string, pollWhileRunning = false) {
  return useQuery({
    queryKey: [...CAMPAIGNS_KEY, id],
    queryFn: () => campaignsApi.getById(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!pollWhileRunning) return false;
      const status = query.state.data?.status;
      return status === "RUNNING" || status === "SCHEDULED" ? 5000 : false;
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
    // 👈 mutationFn now accepts { file, allowDuplicates }
    mutationFn: ({
      file,
      allowDuplicates = false,
    }: {
      file: File;
      allowDuplicates?: boolean;
    }) => campaignsApi.uploadCSV(campaignId, file, allowDuplicates),

    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, campaignId] });

      if (result.imported > 0) {
        toast.success(
          `${result.imported} lead${result.imported !== 1 ? "s" : ""} imported successfully`,
          {
            description:
              result.invalid > 0
                ? `${result.invalid} row${result.invalid !== 1 ? "s" : ""} skipped — missing phone number`
                : undefined,
          },
        );
      } else if (result.imported === 0 && result.duplicates === 0) {
        toast.warning(
          "No leads imported — all rows are missing a phone number",
        );
      }

      if (result.duplicates > 0) {
        const phoneList = result.duplicateNumbers.slice(0, 5).join(", ");
        const overflow = result.duplicates - 5;
        toast.warning(
          `${result.duplicates} duplicate${result.duplicates !== 1 ? "s" : ""} skipped`,
          {
            description:
              overflow > 0
                ? `${phoneList} and ${overflow} more already exist in this campaign`
                : `${phoneList} already exist${result.duplicates === 1 ? "s" : ""} in this campaign`,
            duration: 6000,
          },
        );
      }
    },

    onError: (error: Error) => {
      toast.error("Upload failed", { description: error.message });
    },
  });
}

// ── UPDATED: Accept optional scheduledAt string ──
export function useStartCampaign(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (scheduledAt?: string) =>
      campaignsApi.start(campaignId, scheduledAt),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      qc.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, campaignId] });

      if (data.scheduledAt) {
        toast.success("Campaign Scheduled", {
          description: `Campaign scheduled successfully to start.`,
        });
      } else {
        toast.success("Campaign Started", {
          description: `${data.totalLeads} lead${data.totalLeads !== 1 ? "s" : ""} queued for calling`,
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update campaign start status", {
        description: error.message,
      });
    },
  });
}

export function usePauseCampaign(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => campaignsApi.pause(campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      qc.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, campaignId] });
      toast.success("Campaign paused");
    },
    onError: (error: Error) => {
      toast.error("Failed to pause campaign", { description: error.message });
    },
  });
}

// ── NEW: Cancel Scheduled Campaign Hook ──
export function useCancelScheduleCampaign(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => campaignsApi.cancelSchedule(campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
      qc.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, campaignId] });
      toast.success("Campaign schedule cancelled", {
        description: "Leads have been reset to pending state.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel schedule", { description: error.message });
    },
  });
}
