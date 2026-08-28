import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { batchesApi } from "@/lib/api/batches";
import type { RetryConfig } from "@/types/batch";

const BATCHES_KEY = ["batches"] as const;

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.error ?? err.response?.data?.message ?? fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useBatches(campaignId: string) {
  return useQuery({
    queryKey: [...BATCHES_KEY, campaignId],
    queryFn: () => batchesApi.getAll(campaignId),
    enabled: !!campaignId,
  });
}

export function useBatch(campaignId: string, batchId: string) {
  return useQuery({
    queryKey: [...BATCHES_KEY, campaignId, batchId],
    queryFn: () => batchesApi.getById(campaignId, batchId),
    enabled: !!campaignId && !!batchId,
  });
}

export function useBatchStats(campaignId: string, batchId: string) {
  return useQuery({
    queryKey: [...BATCHES_KEY, campaignId, batchId, "stats"],
    queryFn: () => batchesApi.getStats(campaignId, batchId),
    enabled: !!campaignId && !!batchId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateBatch(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      retryConfig,
    }: {
      file: File;
      retryConfig?: RetryConfig;
    }) => batchesApi.create(campaignId, file, retryConfig),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [...BATCHES_KEY, campaignId] });
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast.success(`Batch created — ${data.stats.imported} leads imported`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to create batch"));
    },
  });
}

export function useRunBatch(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => batchesApi.run(campaignId, batchId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [...BATCHES_KEY, campaignId] });
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast.success(data.message);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to run batch"));
    },
  });
}

export function useScheduleBatch(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      scheduledAt,
    }: {
      batchId: string;
      scheduledAt: string;
    }) => batchesApi.schedule(campaignId, batchId, scheduledAt),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [...BATCHES_KEY, campaignId] });
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast.success(data.message);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to schedule batch"));
    },
  });
}

export function useStopBatch(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => batchesApi.stop(campaignId, batchId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [...BATCHES_KEY, campaignId] });
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast.success("Batch stopped", { description: data.warning });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to stop batch"));
    },
  });
}

export function useResumeBatch(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => batchesApi.resume(campaignId, batchId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [...BATCHES_KEY, campaignId] });
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast.success(
        `New batch created with ${data.remainingLeads} remaining leads`,
      );
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to resume batch"));
    },
  });
}

export function useDeleteBatch(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => batchesApi.delete(campaignId, batchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BATCHES_KEY, campaignId] });
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId] });
      toast.success("Batch deleted");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to delete batch"));
    },
  });
}
