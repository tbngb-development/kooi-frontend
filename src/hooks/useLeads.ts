"use client";

import { useQuery } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api/leads";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { LeadQueryParams, LeadStats } from "@/types/lead";

export function useLeads(params: LeadQueryParams = {}) {
  // Safe mapping to guarantee a structured query key structure
  const queryParamsRecord = params as Record<string, unknown>;
  return useQuery({
    queryKey: QUERY_KEYS.LEADS.list(queryParamsRecord),
    queryFn: () => leadsApi.getAll(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.LEADS.detail(id),
    queryFn: () => leadsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useLeadStats(params?: { campaignId?: string }) {
  const queryParamsRecord = (params ?? {}) as Record<string, unknown>;
  return useQuery<LeadStats>({
    queryKey: QUERY_KEYS.LEADS.stats(queryParamsRecord),
    queryFn: () => leadsApi.getStats(params),
  });
}
