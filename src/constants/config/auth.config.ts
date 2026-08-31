export const SESSION_COOKIES = {
  HAS_SESSION: "has-session",
  USER_ROLE: "user-role",
  IS_PLATFORM_ADMIN: "is-platform-admin",
} as const;

export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const AUTH_STORAGE_KEY = "auth-storage";

export const AUTH_MESSAGES = {
  WELCOME_BACK: (name: string) => `Welcome back, ${name}!`,
  WORKSPACE_LOADED: (name: string) => `Workspace loaded: ${name}`,
  ADMIN_WELCOME: "Welcome, Platform Administrator!",
  ADMIN_UNAUTHORIZED: "Not authorized. Platform administrator access required.",
  ORG_PROVISIONED: "Organization environment provisioned successfully!",
  SESSION_CLOSED: "Session closed successfully",
} as const;

export const AUTH_REDIRECTS = {
  TENANT_HOME: "/dashboard",
  ADMIN_HOME: "/admin/dashboard",
  TENANT_LOGIN: "/login",
  ADMIN_LOGIN: "/admin/login",
} as const;
