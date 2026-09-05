import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_BOLNA_KEY_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/bolna-keys`,
  ASSIGN: (id: string) => `${API_PREFIXES.ADMIN}/bolna-keys/${id}/assign`,
  DEACTIVATE: (id: string) =>
    `${API_PREFIXES.ADMIN}/bolna-keys/${id}/deactivate`,
} as const;
