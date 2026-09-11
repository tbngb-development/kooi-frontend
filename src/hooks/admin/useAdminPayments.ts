"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPaymentsApi } from "@/lib/api/admin/admin-payments";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { toast } from "sonner";

// ── Queries ──────────────────────────────────────────────────────────────────

export function useAdminPayments(params?: {
  tenantId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_PAYMENTS.list(params ?? {}),
    queryFn: () => adminPaymentsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * Per-tenant payment summary.
 * ⚠️ Disabled when `tenantId` is null — the backend requires it.
 *
 * For the global payments page, compute stats client-side from the
 * paginated list or remove the summary cards entirely.
 */
export function useAdminPaymentSummary(tenantId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_PAYMENTS.summary(tenantId),
    queryFn: () => adminPaymentsApi.getSummary(tenantId!),
    enabled: !!tenantId,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Activates an enterprise plan without payment.
 * Only valid when the tenant's effectiveTerms.onboardingFee === 0.
 */
export function useActivateFreePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => adminPaymentsApi.activateFree(tenantId),
    onSuccess: (_, tenantId) => {
      // Invalidate both plan and payment caches for this tenant
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN_PAYMENTS.list({ tenantId }),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN_PAYMENTS.summary(tenantId),
      });
      toast.success("Plan activated (free)");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
