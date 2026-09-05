import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_PAYMENT_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/payments`,
  SUMMARY: `${API_PREFIXES.ADMIN}/payments/summary`,
} as const;
