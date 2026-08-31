import apiClient from "@/lib/axios";
import { BROCHURE_ENDPOINTS } from "@/constants/api-routes/brochure-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Brochure,
  BrochureExtractionResult,
  BrochureSummary,
  FlattenedBrochure,
} from "@/types/brochure";

/**
 * Tenant brochure extraction and query catalog operations.
 * Backend module: `modules/brochure` (tenant routes).
 */
export const brochureApi = {
  extract: async (
    file: File,
    onUploadProgress?: (percent: number) => void,
  ): Promise<BrochureExtractionResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<BrochureExtractionResult>>(
      BROCHURE_ENDPOINTS.EXTRACT,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
        timeout: 120_000,
      },
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to extract brochure details");
    }
    return res.data.data;
  },

  save: async (
    data: FlattenedBrochure,
  ): Promise<{ brochureId: string; brochure: Brochure }> => {
    const res = await apiClient.post<
      ApiResponse<{ brochureId: string; brochure: Brochure }>
    >(BROCHURE_ENDPOINTS.SAVE, data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to write brochure payload");
    }
    return res.data.data;
  },

  getAll: async (): Promise<BrochureSummary[]> => {
    const res = await apiClient.get<ApiResponse<BrochureSummary[]>>(
      BROCHURE_ENDPOINTS.BASE,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochures list");
    }
    return res.data.data;
  },

  getById: async (id: string): Promise<Brochure> => {
    const res = await apiClient.get<ApiResponse<Brochure>>(
      BROCHURE_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochure entity");
    }
    return res.data.data;
  },

  update: async (
    id: string,
    data: Partial<FlattenedBrochure>,
  ): Promise<Brochure> => {
    const res = await apiClient.patch<ApiResponse<Brochure>>(
      BROCHURE_ENDPOINTS.BY_ID(id),
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update brochure fields");
    }
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      BROCHURE_ENDPOINTS.BY_ID(id),
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete brochure");
    }
  },
};
