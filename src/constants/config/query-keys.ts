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
} as const;
