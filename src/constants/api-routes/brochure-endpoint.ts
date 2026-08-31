import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant Property Brochure Extraction & Confirmation endpoints.
 * Backend module: `modules/brochure/presentation/buildBrochureRoutes`
 */
export const BROCHURE_ENDPOINTS = {
  BASE: `${API_PREFIXES.TENANT}/brochures`,
  BY_ID: (id: string) => `${API_PREFIXES.TENANT}/brochures/${id}`,
  EXTRACT: `${API_PREFIXES.TENANT}/brochures/extract`,
  SAVE: `${API_PREFIXES.TENANT}/brochures/save`,
} as const;
