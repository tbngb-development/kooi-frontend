/**
 * Platform super administration routes.
 */
export const ADMIN_ROUTES = {
  LOGIN: "/admin/login",
  DASHBOARD: "/admin/dashboard",
  TENANTS: "/admin/tenants",
  TENANT_DETAIL: (id: string) => `/admin/tenants/${id}` as const,
} as const;
