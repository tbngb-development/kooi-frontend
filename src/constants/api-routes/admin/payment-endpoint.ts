import { API_PREFIXES } from "@/constants/config/api-prefix";

const BASE = `${API_PREFIXES.ADMIN}/payments`;

export const ADMIN_PAYMENT_ENDPOINTS = {
  /** GET — list all payments (?tenantId, ?status, ?page, ?limit) */
  BASE,

  /** GET — per-tenant summary (?tenantId REQUIRED) */
  SUMMARY: `${BASE}/summary`,

  /** POST — activate plan without payment (enterprise, onboardingFee = 0) */
  ACTIVATE_FREE: `${BASE}/activate-free`,
} as const;
