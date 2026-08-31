"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { brochureApi } from "@/lib/api/brochures";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { FlattenedBrochure } from "@/types/brochure";

export function useBrochures() {
  return useQuery({
    queryKey: QUERY_KEYS.BROCHURES.all,
    queryFn: brochureApi.getAll,
  });
}

export function useBrochure(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.BROCHURES.detail(id!),
    queryFn: () => brochureApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useExtractBrochure() {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (percent: number) => void;
    }) => brochureApi.extract(file, onProgress),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSaveBrochure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: FlattenedBrochure) => brochureApi.save(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BROCHURES.all });
      toast.success("Brochure saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateBrochure(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FlattenedBrochure>) =>
      brochureApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BROCHURES.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BROCHURES.detail(id) });
      toast.success("Brochure updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteBrochure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brochureApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BROCHURES.all });
      toast.success("Brochure deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
