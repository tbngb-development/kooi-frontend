"use client";

import { useQuery } from "@tanstack/react-query";
import { adminBatchesApi } from "@/lib/api/admin/admin-batches";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useAdminBatches(tenantId: string, campaignId: string) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(campaignId) &&
    campaignId !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_BATCHES.all(tenantId, campaignId),
    queryFn: () => adminBatchesApi.getAll(tenantId, campaignId),
    enabled: isEnabled,
  });
}

export function useAdminBatch(
  tenantId: string,
  campaignId: string,
  id: string,
) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(campaignId) &&
    campaignId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_BATCHES.detail(tenantId, campaignId, id),
    queryFn: () => adminBatchesApi.getById(tenantId, campaignId, id),
    enabled: isEnabled,
  });
}

export function useAdminBatchStats(
  tenantId: string,
  campaignId: string,
  id: string,
) {
  const isEnabled =
    Boolean(tenantId) &&
    tenantId !== "undefined" &&
    Boolean(campaignId) &&
    campaignId !== "undefined" &&
    Boolean(id) &&
    id !== "undefined";

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_BATCHES.stats(tenantId, campaignId, id),
    queryFn: () => adminBatchesApi.getStats(tenantId, campaignId, id),
    enabled: isEnabled,
  });
}
