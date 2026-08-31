"use client";

import { useQuery } from "@tanstack/react-query";
import { adminCallsApi } from "@/lib/api/admin/admin-calls";
import type { AdminCallQueryParams } from "@/lib/api/admin/admin-calls";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useAdminCalls(params: AdminCallQueryParams) {
  const isTenantValid =
    Boolean(params?.tenantId) && params.tenantId !== "undefined";
  const queryParamsRecord = params as unknown as Record<string, unknown>;

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CALLS.list(params.tenantId, queryParamsRecord),
    queryFn: () => adminCallsApi.getAll(params),
    enabled: isTenantValid,
  });
}

export function useAdminCall(tenantId: string, id: string) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CALLS.detail(tenantId, id),
    queryFn: () => adminCallsApi.getById(tenantId, id),
    enabled: isEnabled,
  });
}

export function useAdminCallTranscript(tenantId: string, id: string) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CALLS.transcript(tenantId, id),
    queryFn: () => adminCallsApi.getTranscript(tenantId, id),
    enabled: isEnabled,
  });
}

export function useAdminCallStats(
  tenantId: string,
  params?: { campaignId?: string; leadId?: string },
) {
  const isTenantValid = Boolean(tenantId) && tenantId !== "undefined";
  const queryParamsRecord = { tenantId, ...params } as Record<string, unknown>;

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CALLS.stats(tenantId, queryParamsRecord),
    queryFn: () => adminCallsApi.getStats(tenantId, params),
    enabled: isTenantValid,
  });
}
