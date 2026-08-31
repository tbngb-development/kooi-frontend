import apiClient from "@/lib/axios";
import { ADMIN_BROCHURE_ENDPOINTS } from "@/constants/api-routes/admin/brochure-endpoint";
import type { ApiResponse } from "@/types/api";
import type { Brochure, BrochureSummary } from "@/types/brochure";

export const adminBrochuresApi = {
  getAll: async (tenantId: string): Promise<BrochureSummary[]> => {
    const res = await apiClient.get<ApiResponse<BrochureSummary[]>>(
      ADMIN_BROCHURE_ENDPOINTS.BASE,
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochures");
    }
    return res.data.data;
  },

  getById: async (tenantId: string, id: string): Promise<Brochure> => {
    const res = await apiClient.get<ApiResponse<Brochure>>(
      ADMIN_BROCHURE_ENDPOINTS.BY_ID(id),
      { params: { tenantId } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochure");
    }
    return res.data.data;
  },
};
