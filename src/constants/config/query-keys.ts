export const QUERY_KEYS = {
  AUTH: {
    all: ["auth"] as const,
    profile: () => [...QUERY_KEYS.AUTH.all, "profile"] as const,
    invites: () => [...QUERY_KEYS.AUTH.all, "invites"] as const,
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
  // ── Admin-specific query keys ──────────────────────────────────────────────
  ADMIN_DASHBOARD: {
    all: ["admin", "dashboard"] as const,
    overview: () => [...QUERY_KEYS.ADMIN_DASHBOARD.all, "overview"] as const,
    tenantsHealth: () =>
      [...QUERY_KEYS.ADMIN_DASHBOARD.all, "tenants-health"] as const,
    activity: () => [...QUERY_KEYS.ADMIN_DASHBOARD.all, "activity"] as const,
  },
  ADMIN_CAMPAIGNS: {
    all: (tenantId: string) => ["admin", "campaigns", tenantId] as const,
    detail: (tenantId: string, id: string) =>
      ["admin", "campaigns", tenantId, id] as const,
    stats: (tenantId: string, id: string) =>
      ["admin", "campaigns", tenantId, id, "stats"] as const,
    performance: (tenantId: string, id: string) =>
      ["admin", "campaigns", tenantId, id, "performance"] as const,
  },
  ADMIN_BATCHES: {
    all: (tenantId: string, campaignId: string) =>
      ["admin", "batches", tenantId, campaignId] as const,
    detail: (tenantId: string, campaignId: string, id: string) =>
      ["admin", "batches", tenantId, campaignId, id] as const,
    stats: (tenantId: string, campaignId: string, id: string) =>
      ["admin", "batches", tenantId, campaignId, id, "stats"] as const,
  },
  ADMIN_LEADS: {
    all: (tenantId: string) => ["admin", "leads", tenantId] as const,
    list: (tenantId: string, params: Record<string, unknown>) =>
      ["admin", "leads", tenantId, "list", params] as const,
    detail: (tenantId: string, id: string) =>
      ["admin", "leads", tenantId, id] as const,
    stats: (tenantId: string, params: Record<string, unknown>) =>
      ["admin", "leads", tenantId, "stats", params] as const,
  },
  ADMIN_CALLS: {
    all: (tenantId: string) => ["admin", "calls", tenantId] as const,
    list: (tenantId: string, params: Record<string, unknown>) =>
      ["admin", "calls", tenantId, "list", params] as const,
    detail: (tenantId: string, id: string) =>
      ["admin", "calls", tenantId, id] as const,
    transcript: (tenantId: string, id: string) =>
      ["admin", "calls", tenantId, "transcript", id] as const,
    stats: (tenantId: string, params: Record<string, unknown>) =>
      ["admin", "calls", tenantId, "stats", params] as const,
  },
  ADMIN_BROCHURES: {
    all: (tenantId: string) => ["admin", "brochures", tenantId] as const,
    detail: (tenantId: string, id: string) =>
      ["admin", "brochures", tenantId, id] as const,
  },
  PLANS: {
    all: ["plans"] as const,
    available: () => [...QUERY_KEYS.PLANS.all, "available"] as const,
    mine: () => [...QUERY_KEYS.PLANS.all, "mine"] as const,
  },
  ADMIN_PLANS: {
    all: ["admin", "plans"] as const,
    detail: (id: string) => ["admin", "plans", id] as const,
  },
  ADMIN_BOLNA_KEYS: {
    all: ["admin", "bolna-keys"] as const,
  },
  WALLET: {
    all: ["wallet"] as const,
    balance: () => [...QUERY_KEYS.WALLET.all, "balance"] as const,
    transactions: (page: number, limit: number) =>
      [...QUERY_KEYS.WALLET.all, "transactions", page, limit] as const,
  },
  PAYMENTS: {
    all: ["payments"] as const,
    orderStatus: (orderId: string) =>
      [...QUERY_KEYS.PAYMENTS.all, "order", orderId] as const,
  },
  OWNER_INVITE: {
    public: (token: string) => ["owner-invite", "public", token] as const,
  },
  ADMIN_INVITES: {
    all: ["admin", "invites"] as const,
  },
} as const;
