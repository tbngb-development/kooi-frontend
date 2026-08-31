/**
 * Centralized API version prefix.
 * Change this in one place to migrate the entire client to a new API version.
 */
export const API_PREFIX = "/api/v1" as const;

export const API_PREFIXES = {
  TENANT: API_PREFIX,
  ADMIN: `${API_PREFIX}/admin`,
} as const;
