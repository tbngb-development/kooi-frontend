import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_BROCHURE_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/brochures`,
  BY_ID: (id: string) => `${API_PREFIXES.ADMIN}/brochures/${id}`,
} as const;
