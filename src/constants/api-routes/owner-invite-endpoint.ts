import { API_PREFIXES } from "@/constants/config/api-prefix";

export const OWNER_INVITE_ENDPOINTS = {
  BY_TOKEN: (token: string) =>
    `${API_PREFIXES.TENANT}/auth/owner-invites/${token}`,
  ACCEPT: `${API_PREFIXES.TENANT}/auth/owner-invites/accept`,
} as const;
