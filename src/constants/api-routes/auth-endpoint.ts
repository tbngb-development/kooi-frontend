// V1: All auth routes under /api/v1/auth/*
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  REFRESH_TOKEN: "/api/v1/auth/refresh",
  REGISTER: "/api/v1/auth/register",
  SELECT_TENANT: "/api/v1/auth/select-tenant",
  PROFILE: "/api/v1/auth/profile",
  INVITES: "/api/v1/auth/invites",
  ACCEPT_INVITE: "/api/v1/auth/accept-invite",
  ADMIN_LOGIN: "/api/v1/admin/auth/login",
} as const;
