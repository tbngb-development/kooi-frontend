import { API_PREFIXES } from "@/constants/config/api-prefix";

const BASE = `${API_PREFIXES.ADMIN}/wallet`;

export const ADMIN_WALLET_ENDPOINTS = {
  /** GET — tenant wallet */
  TENANT_WALLET: (tenantId: string) =>
    `${BASE}/tenants/${tenantId}` as const,

  /** GET — tenant transactions (?page, ?limit, ?type) */
  TENANT_TRANSACTIONS: (tenantId: string) =>
    `${BASE}/tenants/${tenantId}/transactions` as const,

  /** POST — manual balance adjustment */
  ADJUST: `${BASE}/adjust`,
} as const;