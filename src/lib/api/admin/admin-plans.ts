import apiClient from "@/lib/axios";
import { ADMIN_PLAN_ENDPOINTS } from "@/constants/api-routes/admin/plan-endpoint";
import type { ApiResponse } from "@/types/api";
import type { Plan, CreatePlanInput, UpdatePlanInput } from "@/types/plan";

export const adminPlansApi = {
  getAll: async (includeInactive = true): Promise<Plan[]> => {
    const res = await apiClient.get<ApiResponse<Plan[]>>(
      ADMIN_PLAN_ENDPOINTS.BASE,
      { params: { includeInactive } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch plans");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Plan> => {
    const res = await apiClient.get<ApiResponse<Plan>>(
      ADMIN_PLAN_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch plan");
    }
    return res.data.data;
  },

  create: async (data: CreatePlanInput): Promise<Plan> => {
    const res = await apiClient.post<ApiResponse<Plan>>(
      ADMIN_PLAN_ENDPOINTS.BASE,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create plan");
    }
    return res.data.data;
  },

  update: async (id: string, data: UpdatePlanInput): Promise<Plan> => {
    const res = await apiClient.patch<ApiResponse<Plan>>(
      ADMIN_PLAN_ENDPOINTS.BY_ID(id),
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update plan");
    }
    return res.data.data;
  },
};
