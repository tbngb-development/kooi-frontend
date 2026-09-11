import apiClient from "@/lib/axios";
import { PLAN_ENDPOINTS } from "@/constants/api-routes/plan-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  ChangePlanRequest,
  ChangePlanResponse,
  Plan,
  TenantPlan,
} from "@/types/plan";

export const plansApi = {
  /**
   * GET /v1/plans/available
   * Returns catalogue plans with commercial data nested in `currentVersion`.
   */
  getAvailable: async (): Promise<Plan[]> => {
    const res = await apiClient.get<ApiResponse<Plan[]>>(
      PLAN_ENDPOINTS.AVAILABLE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch available plans");
    }
    return res.data.data;
  },

  /**
   * GET /v1/plans/mine
   * Returns the tenant's active plan with `effectiveTerms` snapshot.
   * Returns null when no plan has been selected yet.
   */
  getMine: async (): Promise<TenantPlan | null> => {
    try {
      const res = await apiClient.get<ApiResponse<TenantPlan>>(
        PLAN_ENDPOINTS.MINE,
      );
      if (!res.data.success) return null;
      return res.data.data;
    } catch {
      return null;
    }
  },

  /**
   * POST /v1/plans/:planId/select
   * Creates a TenantPlan with PENDING_PAYMENT status.
   * Throws on 409 (already active) or 403 (enterprise).
   */
  select: async (planId: string): Promise<TenantPlan> => {
    const res = await apiClient.post<ApiResponse<TenantPlan>>(
      PLAN_ENDPOINTS.SELECT(planId),
      {},
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to select plan");
    }
    return res.data.data;
  },

  /**
   * POST /v1/plans/change
   *
   * Self-service upgrade / downgrade.
   * - Downgrade / Lateral → `effectiveImmediately: true`, no payment needed.
   * - Upgrade → `requiresPayment: true`, frontend must initiate payment flow.
   */
  changePlan: async (input: ChangePlanRequest): Promise<ChangePlanResponse> => {
    const res = await apiClient.post<ApiResponse<ChangePlanResponse>>(
      PLAN_ENDPOINTS.CHANGE,
      input,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to change plan");
    }
    return res.data.data;
  },
};
