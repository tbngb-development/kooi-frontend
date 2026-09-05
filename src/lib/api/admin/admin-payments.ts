import apiClient from "@/lib/axios";
import { ADMIN_PAYMENT_ENDPOINTS } from "@/constants/api-routes/admin/payment-endpoint";
import type { ApiResponse } from "@/types/api";
import type { AdminPaymentsPage, AdminPaymentSummary } from "@/types/payment";

export const adminPaymentsApi = {
  list: async (params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminPaymentsPage> => {
    const res = await apiClient.get<ApiResponse<any>>(
      ADMIN_PAYMENT_ENDPOINTS.BASE,
      { params },
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch admin payments");
    }

    const payload = res.data.data;

    if (Array.isArray(payload)) {
      return {
        items: payload,
        total: payload.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? payload.length,
      };
    }

    if (Array.isArray(payload.payments)) {
      return {
        items: payload.payments,
        total:
          payload.pagination?.total ?? payload.total ?? payload.payments.length,
        page: payload.pagination?.page ?? params?.page ?? 1,
        limit: payload.pagination?.limit ?? params?.limit ?? 20,
      };
    }

    if (Array.isArray(payload.items)) {
      return {
        items: payload.items,
        total: payload.total ?? payload.items.length,
        page: payload.page ?? params?.page ?? 1,
        limit: payload.limit ?? params?.limit ?? 20,
      };
    }

    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  },

  getSummary: async (): Promise<AdminPaymentSummary> => {
    const res = await apiClient.get<ApiResponse<any>>(
      ADMIN_PAYMENT_ENDPOINTS.SUMMARY,
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch payments summary");
    }

    const raw = res.data.data;

    const totalRevenue = Number(
      raw.totalRevenue ??
        raw.totalRevenuePaisa ??
        raw.revenue ??
        raw.totalAmount ??
        raw.total_revenue ??
        0,
    );

    const mrrApprox = Number(
      raw.mrrApprox ??
        raw.mrrApproxPaisa ??
        raw.mrr ??
        raw.approxMrr ??
        raw.mrr_approx ??
        raw.thirtyDayMrr ??
        0,
    );

    const successCount = Number(
      raw.successCount ??
        raw.successfulPayments ??
        raw.success ??
        raw.success_count ??
        0,
    );

    const failedCount = Number(
      raw.failedCount ??
        raw.failedPayments ??
        raw.failed ??
        raw.failed_count ??
        0,
    );

    return {
      totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
      mrrApprox: isNaN(mrrApprox) ? 0 : mrrApprox,
      successCount: isNaN(successCount) ? 0 : successCount,
      failedCount: isNaN(failedCount) ? 0 : failedCount,
    };
  },
};
