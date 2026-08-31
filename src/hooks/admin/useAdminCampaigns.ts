"use client";

import { useQuery } from "@tanstack/react-query";
import { adminCampaignsApi } from "@/lib/api/admin/admin-campaigns";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useAdminCampaigns(tenantId: string) {
  const isTenantValid = Boolean(tenantId) && tenantId !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS.all(tenantId),
    queryFn: () => adminCampaignsApi.getAll(tenantId),
    enabled: isTenantValid,
  });
}

export function useAdminCampaign(tenantId: string, id: string) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS.detail(tenantId, id),
    queryFn: () => adminCampaignsApi.getById(tenantId, id),
    enabled: isEnabled,
  });
}

export function useAdminCampaignStats(tenantId: string, id: string) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS.stats(tenantId, id),
    queryFn: () => adminCampaignsApi.getStats(tenantId, id),
    enabled: isEnabled,
  });
}

export function useAdminCampaignPerformance(tenantId: string, id: string) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS.performance(tenantId, id),
    queryFn: () => adminCampaignsApi.getPerformance(tenantId, id),
    enabled: isEnabled,
  });
}