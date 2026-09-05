import apiClient from "@/lib/axios";
import { PLAN_ENDPOINTS } from "@/constants/api-routes/plan-endpoint";
import type { ApiResponse } from "@/types/api";
import type { Plan, TenantPlan } from "@/types/plan";

export const plansApi = {
  getAvailable: async (): Promise<Plan[]> => {
    const res = await apiClient.get<ApiResponse<Plan[]>>(
      PLAN_ENDPOINTS.AVAILABLE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch available plans");
    }
    return res.data.data;
  },

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

  select: async (planId: string): Promise<TenantPlan> => {
    const res = await apiClient.post<ApiResponse<TenantPlan>>(
      PLAN_ENDPOINTS.SELECT(planId),
      {},
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to assign plan package");
    }
    return res.data.data;
  },
};
