import {
  SESSION_COOKIES,
  SESSION_COOKIE_MAX_AGE_SECONDS,
} from "@/constants/config/auth.config";
import type { TenantRole } from "@/types/tenant";

/**
 * Non-sensitive session indicator cookies read by Next.js middleware.
 * Secure HttpOnly cookies (access_token/refresh_token) are managed by the backend.
 */
export function setSessionIndicator(
  role: TenantRole | string,
  isPlatformAdmin: boolean,
): void {
  if (typeof document === "undefined") return;

  const attrs = `path=/; max-age=${SESSION_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  document.cookie = `${SESSION_COOKIES.HAS_SESSION}=true; ${attrs}`;
  document.cookie = `${SESSION_COOKIES.USER_ROLE}=${encodeURIComponent(role)}; ${attrs}`;
  document.cookie = `${SESSION_COOKIES.IS_PLATFORM_ADMIN}=${isPlatformAdmin ? "true" : "false"}; ${attrs}`;
}

export function clearSessionIndicator(): void {
  if (typeof document === "undefined") return;

  const expire =
    "path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  document.cookie = `${SESSION_COOKIES.HAS_SESSION}=; ${expire}`;
  document.cookie = `${SESSION_COOKIES.USER_ROLE}=; ${expire}`;
  document.cookie = `${SESSION_COOKIES.IS_PLATFORM_ADMIN}=; ${expire}`;
}
