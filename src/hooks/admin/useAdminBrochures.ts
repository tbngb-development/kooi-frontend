"use client";

import { useQuery } from "@tanstack/react-query";
import { adminBrochuresApi } from "@/lib/api/admin/admin-brochures";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useAdminBrochures(tenantId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_BROCHURES.all(tenantId),
    queryFn: () => adminBrochuresApi.getAll(tenantId),
    enabled: !!tenantId,
  });
}

export function useAdminBrochure(tenantId: string, id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_BROCHURES.detail(tenantId, id),
    queryFn: () => adminBrochuresApi.getById(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}
