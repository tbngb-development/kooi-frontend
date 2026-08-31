"use client";

import { useQuery } from "@tanstack/react-query";
import { callsApi } from "@/lib/api/calls";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { CallQueryParams } from "@/types/call";

export function useCalls(params: CallQueryParams = {}) {
  const queryParamsRecord = params as Record<string, unknown>;
  return useQuery({
    queryKey: QUERY_KEYS.CALLS.list(queryParamsRecord),
    queryFn: () => callsApi.getAll(params),
  });
}

export function useCall(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CALLS.detail(id),
    queryFn: () => callsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCallStats(params?: { campaignId?: string }) {
  const queryParamsRecord = (params ?? {}) as Record<string, unknown>;
  return useQuery({
    queryKey: QUERY_KEYS.CALLS.stats(queryParamsRecord),
    queryFn: () => callsApi.getCallStats(params),
  });
}
