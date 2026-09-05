"use client";

import { useQuery } from "@tanstack/react-query";
import { adminPaymentsApi } from "@/lib/api/admin/admin-payments";

export const ADMIN_PAYMENTS_KEYS = {
  all: ["admin", "payments"] as const,
  list: (params: Record<string, unknown>) =>
    [...ADMIN_PAYMENTS_KEYS.all, "list", params] as const,
  summary: () => [...ADMIN_PAYMENTS_KEYS.all, "summary"] as const,
};

export function useAdminPayments(params?: {
  tenantId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ADMIN_PAYMENTS_KEYS.list(params ?? {}),
    queryFn: () => adminPaymentsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminPaymentsSummary() {
  return useQuery({
    queryKey: ADMIN_PAYMENTS_KEYS.summary(),
    queryFn: adminPaymentsApi.getSummary,
  });
}
