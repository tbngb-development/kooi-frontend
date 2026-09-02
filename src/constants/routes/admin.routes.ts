export const ADMIN_ROUTES = {
  LOGIN: "/admin/login",
  DASHBOARD: "/admin/dashboard",
  TENANTS: "/admin/tenants",
  TENANT_DETAIL: (id: string) => `/admin/tenants/${id}` as const,
  TENANT_CAMPAIGNS: (id: string) => `/admin/tenants/${id}/campaigns` as const,
  TENANT_CAMPAIGN_DETAIL: (id: string, campId: string) =>
    `/admin/tenants/${id}/campaigns/${campId}` as const,
  TENANT_LEADS: (id: string) => `/admin/tenants/${id}/leads` as const,
  TENANT_LEAD_DETAIL: (id: string, leadId: string) =>
    `/admin/tenants/${id}/leads/${leadId}` as const,
  TENANT_CALLS: (id: string) => `/admin/tenants/${id}/calls` as const,
  TENANT_CALL_DETAIL: (id: string, callId: string) =>
    `/admin/tenants/${id}/calls/${callId}` as const,
  TENANT_ASSISTANTS: (id: string) => `/admin/tenants/${id}/assistants` as const,
  TENANT_BATCHES: (id: string) => `/admin/tenants/${id}/batches` as const,
  PLANS: "/admin/plans",
  API_KEYS: "/admin/api-keys",
} as const;
