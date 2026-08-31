import { API_PREFIXES } from "@/constants/config/api-prefix";

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIXES.TENANT}/auth/login`,
  LOGOUT: `${API_PREFIXES.TENANT}/auth/logout`,
  REFRESH: `${API_PREFIXES.TENANT}/auth/refresh`,
  REGISTER: `${API_PREFIXES.TENANT}/auth/register`,
  SELECT_TENANT: `${API_PREFIXES.TENANT}/auth/select-tenant`,
  PROFILE: `${API_PREFIXES.TENANT}/auth/profile`,
  INVITES: `${API_PREFIXES.TENANT}/auth/invites`,
  ACCEPT_INVITE: `${API_PREFIXES.TENANT}/auth/accept-invite`,
} as const;
