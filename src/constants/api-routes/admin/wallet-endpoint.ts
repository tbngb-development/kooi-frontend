import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_WALLET_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/wallet`,
  TRANSACTIONS: `${API_PREFIXES.ADMIN}/wallet/transactions`,
  ADJUST: `${API_PREFIXES.ADMIN}/wallet/adjust`,
} as const;
