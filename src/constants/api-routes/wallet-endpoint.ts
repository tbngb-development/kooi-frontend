import { API_PREFIXES } from "@/constants/config/api-prefix";

export const WALLET_ENDPOINTS = {
  BASE: `${API_PREFIXES.TENANT}/wallet`,
  TRANSACTIONS: `${API_PREFIXES.TENANT}/wallet/transactions`,
  THRESHOLD: `${API_PREFIXES.TENANT}/wallet/threshold`,
} as const;
