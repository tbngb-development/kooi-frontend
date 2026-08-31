export const QUERY_KEYS = {
  AUTH: {
    all: ["auth"] as const,
    profile: () => [...QUERY_KEYS.AUTH.all, "profile"] as const,
  },
  WORKSPACE: {
    current: ["workspace", "current"] as const,
    stats: ["workspace", "current", "stats"] as const,
  },
  TENANTS: {
    all: ["admin", "tenants"] as const,
    detail: (id: string) => [...QUERY_KEYS.TENANTS.all, id] as const,
    stats: (id: string) => [...QUERY_KEYS.TENANTS.all, id, "stats"] as const,
  },
  USERS: {
    all: ["users"] as const,
  },
  ASSISTANTS: {
    all: ["assistants"] as const,
    detail: (id: string) => [...QUERY_KEYS.ASSISTANTS.all, id] as const,
    bolnaAgents: ["assistants", "admin", "bolna-agents"] as const,
    adminList: (tenantId: string) =>
      [...QUERY_KEYS.ASSISTANTS.all, "admin", tenantId] as const,
  },
  CAMPAIGNS: {
    all: ["campaigns"] as const,
    detail: (id: string) => [...QUERY_KEYS.CAMPAIGNS.all, id] as const,
    stats: (id: string) => [...QUERY_KEYS.CAMPAIGNS.all, id, "stats"] as const,
    performance: (id: string) =>
      [...QUERY_KEYS.CAMPAIGNS.all, id, "performance"] as const,
  },
  BATCHES: {
    all: ["batches"] as const,
    list: (campaignId: string) =>
      [...QUERY_KEYS.BATCHES.all, campaignId] as const,
    detail: (campaignId: string, batchId: string) =>
      [...QUERY_KEYS.BATCHES.all, campaignId, batchId] as const,
    stats: (campaignId: string, batchId: string) =>
      [...QUERY_KEYS.BATCHES.all, campaignId, batchId, "stats"] as const,
  },
  LEADS: {
    all: ["leads"] as const,
    list: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.LEADS.all, "list", params] as const,
    detail: (id: string) => [...QUERY_KEYS.LEADS.all, "detail", id] as const,
    stats: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.LEADS.all, "stats", params] as const,
  },
  CALLS: {
    all: ["calls"] as const,
    list: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.CALLS.all, "list", params] as const,
    detail: (id: string) => [...QUERY_KEYS.CALLS.all, "detail", id] as const,
    transcript: (id: string) =>
      [...QUERY_KEYS.CALLS.all, "transcript", id] as const,
    stats: (params: Record<string, unknown>) =>
      [...QUERY_KEYS.CALLS.all, "stats", params] as const,
  },
  BROCHURES: {
    all: ["brochures"] as const,
    detail: (id: string) => [...QUERY_KEYS.BROCHURES.all, id] as const,
  },
  DASHBOARD: {
    all: ["dashboard"] as const,
    overview: () => [...QUERY_KEYS.DASHBOARD.all, "overview"] as const,
    activity: () => [...QUERY_KEYS.DASHBOARD.all, "activity"] as const,
    campaigns: () => [...QUERY_KEYS.DASHBOARD.all, "campaigns"] as const,
  },
} as const;
