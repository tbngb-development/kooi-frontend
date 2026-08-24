// src/hooks/useCalls.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import { callsApi } from "@/lib/api/calls";
import type { CallQueryParams } from "@/types";

export const CALLS_KEY = ["calls"] as const;

export function useCalls(params: CallQueryParams = {}) {
  return useQuery({
    queryKey: [...CALLS_KEY, params],
    queryFn: () => callsApi.getAll(params),
  });
}

export function useCall(id: string) {
  return useQuery({
    queryKey: [...CALLS_KEY, id],
    queryFn: () => callsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCallStats(params?: { campaignId?: string }) {
  return useQuery({
    queryKey: [...CALLS_KEY, "stats", params],
    queryFn: () => callsApi.getCallStats(params), // from lib/api/calls.ts
  });
}

// export function useCallTranscript(id: string) {
//   return useQuery({
//     queryKey: [...CALLS_KEY, id, 'transcript'],
//     queryFn: () => callsApi.getTranscript(id),
//     enabled: Boolean(id),
//   });
// }
