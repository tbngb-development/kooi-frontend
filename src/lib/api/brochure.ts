// src/lib/api/brochure.ts

import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  Brochure,
  BrochureExtractionResult,
  BrochureSummary,
  FlattenedBrochure,
} from "@/types";

export const brochureApi = {
  // ── Extract PDF → returns structured data, does NOT save ──────────────────
  extract: async (
    file: File,
    onUploadProgress?: (percent: number) => void,
  ): Promise<BrochureExtractionResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<BrochureExtractionResult>>(
      "/api/brochure/extract",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
        // Large PDF + AI processing = long timeout
        timeout: 120_000,
      },
    );

    // ← ADD THIS
    console.log(
      "[BrochureAPI] Extract response:",
      JSON.stringify(res.data.data, null, 2),
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to extract brochure");
    }
    return res.data.data;
  },

  // ── Save confirmed/edited data → DB ───────────────────────────────────────
  save: async (
    data: FlattenedBrochure,
  ): Promise<{ brochureId: string; brochure: Brochure }> => {
    const res = await apiClient.post<
      ApiResponse<{ brochureId: string; brochure: Brochure }>
    >("/api/brochure/save", data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to save brochure");
    }
    return res.data.data;
  },

  // ── List all brochures (summary) ──────────────────────────────────────────
  getAll: async (): Promise<BrochureSummary[]> => {
    const res =
      await apiClient.get<ApiResponse<BrochureSummary[]>>("/api/brochure");
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochures");
    }
    return res.data.data;
  },

  // ── Get single brochure full detail ───────────────────────────────────────
  getById: async (id: string): Promise<Brochure> => {
    const res = await apiClient.get<ApiResponse<Brochure>>(
      `/api/brochure/${id}`,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch brochure");
    }
    return res.data.data;
  },

  // ── Update fields ─────────────────────────────────────────────────────────
  update: async (
    id: string,
    data: Partial<FlattenedBrochure>,
  ): Promise<Brochure> => {
    const res = await apiClient.patch<ApiResponse<Brochure>>(
      `/api/brochure/${id}`,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update brochure");
    }
    return res.data.data;
  },

  // ── Delete ────────────────────────────────────────────────────────────────
  delete: async (id: string): Promise<void> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/api/brochure/${id}`,
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to delete brochure");
    }
  },
};
