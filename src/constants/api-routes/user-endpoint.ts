import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Workspace users management routes.
 * Backend module: `modules/users/presentation/buildUserRoutes`
 */
export const USER_ENDPOINTS = {
  BASE: `${API_PREFIXES.TENANT}/users`,
  BY_ID: (id: string) => `${API_PREFIXES.TENANT}/users/${id}`,
} as const;
