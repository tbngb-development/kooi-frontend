import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_INVITE_ENDPOINTS = {
  BASE: `${API_PREFIXES.ADMIN}/invites`,
  RESEND: (id: string) => `${API_PREFIXES.ADMIN}/invites/${id}/resend` as const,
  REVOKE: (id: string) => `${API_PREFIXES.ADMIN}/invites/${id}/revoke` as const,
} as const;
