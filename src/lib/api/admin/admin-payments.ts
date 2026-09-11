import apiClient from "@/lib/axios";
import { ADMIN_PAYMENT_ENDPOINTS } from "@/constants/api-routes/admin/payment-endpoint";
import type { ApiResponse } from "@/types/api";
import type { AdminPaymentsPage, AdminPaymentSummary } from "@/types/payment";

export const adminPaymentsApi = {
  /**
   * GET /v1/admin/payments?tenantId=&status=&page=&limit=
   * All params optional — omit tenantId for platform-wide list.
   */
  list: async (params?: {
    tenantId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminPaymentsPage> => {
    const res = await apiClient.get<ApiResponse<AdminPaymentsPage>>(
      ADMIN_PAYMENT_ENDPOINTS.BASE,
      { params },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch admin payments");
    }
    return res.data.data;
  },

  /**
   * GET /v1/admin/payments/summary?tenantId=
   * ⚠️ tenantId is REQUIRED by the backend.
   * Returns per-tenant stats — no global summary endpoint exists in V1.
   */
  getSummary: async (tenantId: string): Promise<AdminPaymentSummary> => {
    const res = await apiClient.get<ApiResponse<AdminPaymentSummary>>(
      ADMIN_PAYMENT_ENDPOINTS.SUMMARY,
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch payment summary");
    }
    return res.data.data;
  },

  /**
   * POST /v1/admin/payments/activate-free
   * Activates an enterprise tenant's plan without payment.
   * Only valid when effectiveTerms.onboardingFee === 0.
   */
  activateFree: async (tenantId: string): Promise<void> => {
    const res = await apiClient.post<ApiResponse<unknown>>(
      ADMIN_PAYMENT_ENDPOINTS.ACTIVATE_FREE,
      { tenantId },
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to activate free plan");
    }
  },
};
