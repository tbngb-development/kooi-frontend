import { NextRequest, NextResponse } from "next/server";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";

const AUTH_PAGES = [
  APP_ROUTES.LOGIN,
  APP_ROUTES.REGISTER,
  ADMIN_ROUTES.LOGIN,
] as string[];

function getSessionInfo(req: NextRequest) {
  const hasAccessToken = req.cookies.has("access_token");
  const hasSessionCookie = req.cookies.get("has-session")?.value === "true";

  const isAuthenticated = hasAccessToken || hasSessionCookie;

  const isPlatformAdmin =
    req.cookies.get("is-platform-admin")?.value === "true" ||
    req.cookies.get("user-role")?.value === "SUPER_ADMIN" ||
    req.cookies.get("auth-role")?.value === "SUPER_ADMIN";

  const userRole =
    req.cookies.get("user-role")?.value ??
    req.cookies.get("auth-role")?.value ??
    null;

  return { isAuthenticated, isPlatformAdmin, userRole };
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { isAuthenticated, isPlatformAdmin } = getSessionInfo(req);

  // ── 1. Bypass static assets, resources, and public API calls ──────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── 2. Public Landing Page ("/") ──────────────────────────────────────────
  if (pathname === APP_ROUTES.HOME) {
    return NextResponse.next();
  }

  // Helper to construct response with strict Cache-Control headers for protected views
  const preventCache = (res: NextResponse) => {
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  };

  // ── 3. Auth Pages (/login, /register, /admin/login) ───────────────────────
  if (AUTH_PAGES.includes(pathname)) {
    if (isAuthenticated) {
      if (isPlatformAdmin) {
        return preventCache(
          NextResponse.redirect(new URL(ADMIN_ROUTES.DASHBOARD, req.url)),
        );
      }
      if (pathname === APP_ROUTES.LOGIN || pathname === APP_ROUTES.REGISTER) {
        return preventCache(
          NextResponse.redirect(new URL(APP_ROUTES.DASHBOARD, req.url)),
        );
      }
    }
    return NextResponse.next();
  }

  // ── 4. Platform Admin Routes (/admin/*) ───────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return preventCache(
        NextResponse.redirect(new URL(ADMIN_ROUTES.LOGIN, req.url)),
      );
    }
    if (!isPlatformAdmin) {
      // Non-platform admin trying to enter admin panel -> bounce back to tenant workspace
      return preventCache(
        NextResponse.redirect(new URL(APP_ROUTES.DASHBOARD, req.url)),
      );
    }
    return preventCache(NextResponse.next());
  }

  // ── 5. Protected Tenant Workspace Routes ──────────────────────────────────
  if (!isAuthenticated) {
    const loginUrl = new URL(APP_ROUTES.LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return preventCache(NextResponse.redirect(loginUrl));
  }

  // Apply cache-prevention headers to authenticated page renders
  return preventCache(NextResponse.next());
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/admin/:path*",
    "/dashboard/:path*",
    "/campaigns/:path*",
    "/assistants/:path*",
    "/leads/:path*",
    "/calls/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/brochures/:path*",
  ],
};
