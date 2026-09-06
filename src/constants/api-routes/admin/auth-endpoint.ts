import { API_PREFIXES } from "@/constants/config/api-prefix";

export const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIXES.ADMIN}/auth/login`,
  LOGOUT: `${API_PREFIXES.ADMIN}/auth/logout`,
  REFRESH: `${API_PREFIXES.ADMIN}/auth/refresh`,

  // ── Admin Password Reset & Change ──────────────────────────────────────────
  FORGOT_PASSWORD: `${API_PREFIXES.ADMIN}/auth/forgot-password`,
  VERIFY_OTP: `${API_PREFIXES.ADMIN}/auth/forgot-password/verify-otp`,
  RESET_PASSWORD: `${API_PREFIXES.ADMIN}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_PREFIXES.ADMIN}/auth/change-password`,
} as const;
