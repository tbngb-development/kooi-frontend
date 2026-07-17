// src/hooks/useBrochure.ts

'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { brochureApi } from '@/lib/api/brochure';
import type { FlattenedBrochure } from '@/types';

export const BROCHURES_KEY = ['brochures'] as const;

// ── List all brochures ────────────────────────────────────────────────────────
export function useBrochures() {
  return useQuery({
    queryKey: BROCHURES_KEY,
    queryFn:  brochureApi.getAll,
  });
}

// ── Get single brochure ───────────────────────────────────────────────────────
export function useBrochure(id: string | null) {
  return useQuery({
    queryKey: [...BROCHURES_KEY, id],
    queryFn:  () => brochureApi.getById(id!),
    enabled:  Boolean(id),
  });
}

// ── Extract PDF — no DB save ──────────────────────────────────────────────────
// Used in campaign creation step 1
// Not a standard mutation — managed manually with useState for progress
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

// ── Save confirmed brochure → DB ──────────────────────────────────────────────
export function useSaveBrochure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: FlattenedBrochure) => brochureApi.save(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BROCHURES_KEY });
      toast.success('Brochure saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Update brochure fields ────────────────────────────────────────────────────
export function useUpdateBrochure(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FlattenedBrochure>) =>
      brochureApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BROCHURES_KEY });
      toast.success('Brochure updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Delete brochure ───────────────────────────────────────────────────────────
export function useDeleteBrochure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brochureApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BROCHURES_KEY });
      toast.success('Brochure deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}