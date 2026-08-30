import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Brochure,
  BrochureExtractionResult,
  BrochureSummary,
  FlattenedBrochure,
} from "@/types";

// V1: Pluralized routes targeting /api/v1/brochures
export const brochureApi = {
  // ── Extract PDF → returns AI extracted structured preview ──────────────────
  extract: async (
    file: File,
    onUploadProgress?: (percent: number) => void,
  ): Promise<BrochureExtractionResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<BrochureExtractionResult>>(
      "/api/v1/brochures/extract",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
        timeout: 120_000, // Extractor processing headroom
      },
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to extract brochure details");
    }
    return res.data.data;
  },

  // ── Save validated brochure data ──────────────────────────────────────────
  save: async (
    data: FlattenedBrochure,
  ): Promise<{ brochureId: string; brochure: Brochure }> => {
    const res = await apiClient.post<
      ApiResponse<{ brochureId: string; brochure: Brochure }>
    >("/api/v1/brochures/save", data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to write brochure payload");
    }
    return res.data.data;
  },

  // ── Query listings ────────────────────────────────────────────────────────
  getAll: async (): Promise<BrochureSummary[]> => {
    const res = await apiClient.get<ApiResponse<BrochureSummary[]>>("/api/v1/brochures");
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochures list");
    }
    return res.data.data;
  },

  // ── Query detailed brochure specifications ────────────────────────────────
  getById: async (id: string): Promise<Brochure> => {
    const res = await apiClient.get<ApiResponse<Brochure>>(
      `/api/v1/brochures/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochure entity");
    }
    return res.data.data;
  },

  // ── Edit properties ───────────────────────────────────────────────────────
  update: async (
    id: string,
    data: Partial<FlattenedBrochure>,
  ): Promise<Brochure> => {
    const res = await apiClient.patch<ApiResponse<Brochure>>(
      `/api/v1/brochures/${id}`,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update brochure fields");
    }
    return res.data.data;
  },

  // ── Remove brochure ───────────────────────────────────────────────────────
  delete: async (id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/api/v1/brochures/${id}`,
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete brochure");
    }
  },
};