"use client";

import { useQuery } from "@tanstack/react-query";
import { adminLeadsApi } from "@/lib/api/admin/admin-leads";
import type { AdminLeadQueryParams } from "@/lib/api/admin/admin-leads";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useAdminLeads(params: AdminLeadQueryParams) {
  const queryParamsRecord = params as unknown as Record<string, unknown>;
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_LEADS.list(params.tenantId, queryParamsRecord),
    queryFn: () => adminLeadsApi.getAll(params),
    enabled: !!params.tenantId,
  });
}

export function useAdminLead(tenantId: string, id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_LEADS.detail(tenantId, id),
    queryFn: () => adminLeadsApi.getById(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

export function useAdminLeadStats(tenantId: string, campaignId?: string) {
  const params = { tenantId, campaignId } as Record<string, unknown>;
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_LEADS.stats(tenantId, params),
    queryFn: () => adminLeadsApi.getStats(tenantId, campaignId),
    enabled: !!tenantId,
  });
}
