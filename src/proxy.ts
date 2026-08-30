import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/admin/login"];

function getSessionInfo(req: NextRequest) {
  // Reads HttpOnly cookie (access_token) or client session indicator cookies
  const hasAccessToken = req.cookies.has("access_token");
  const hasSessionCookie = req.cookies.get("has-session")?.value === "true";
  const hasLegacyToken = req.cookies.has("auth-token");

  const isAuthenticated = hasAccessToken || hasSessionCookie || hasLegacyToken;

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
  // Allow all visitors (authenticated or not) to view the landing page
  if (pathname === "/") {
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
          NextResponse.redirect(new URL("/admin/dashboard", req.url)),
        );
      }
      if (pathname === "/login" || pathname === "/register") {
        return preventCache(
          NextResponse.redirect(new URL("/dashboard", req.url)),
        );
      }
    }
    return NextResponse.next();
  }

  // ── 4. Platform Admin Routes (/admin/*) ───────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return preventCache(
        NextResponse.redirect(new URL("/admin/login", req.url)),
      );
    }
    if (!isPlatformAdmin) {
      // Non-platform admin trying to enter admin panel -> bounce back to tenant workspace
      return preventCache(
        NextResponse.redirect(new URL("/dashboard", req.url)),
      );
    }
    return preventCache(NextResponse.next());
  }

  // ── 5. Protected Tenant Workspace Routes ──────────────────────────────────
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
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
