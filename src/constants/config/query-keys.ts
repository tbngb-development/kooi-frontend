export const QUERY_KEYS = {
  AUTH: {
    all: ["auth"] as const,
    profile: () => [...QUERY_KEYS.AUTH.all, "profile"] as const,
  },
} as const;