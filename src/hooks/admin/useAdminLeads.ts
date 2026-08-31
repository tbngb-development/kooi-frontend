"use client";

import { useQuery } from "@tanstack/react-query";
import { adminLeadsApi } from "@/lib/api/admin/admin-leads";
import type { AdminLeadQueryParams } from "@/lib/api/admin/admin-leads";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useAdminLeads(params: AdminLeadQueryParams) {
  const isTenantValid =
    Boolean(params?.tenantId) && params.tenantId !== "undefined";
  const queryParamsRecord = params as unknown as Record<string, unknown>;

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_LEADS.list(params.tenantId, queryParamsRecord),
    queryFn: () => adminLeadsApi.getAll(params),
    enabled: isTenantValid,
  });
}

export function useAdminLead(tenantId: string, id: string) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_LEADS.detail(tenantId, id),
    queryFn: () => adminLeadsApi.getById(tenantId, id),
    enabled: isEnabled,
  });
}

export function useAdminLeadStats(tenantId: string, campaignId?: string) {
  const isTenantValid = Boolean(tenantId) && tenantId !== "undefined";
  const params = { tenantId, campaignId } as Record<string, unknown>;

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_LEADS.stats(tenantId, params),
    queryFn: () => adminLeadsApi.getStats(tenantId, campaignId),
    enabled: isTenantValid,
  });
}
