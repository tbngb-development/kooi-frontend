// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/admin/login"];

function getTokenFromRequest(req: NextRequest): {
  token: string | null;
  role: string | null;
} {
  // Zustand persist stores in localStorage — not accessible in middleware.
  // We use a separate cookie set on login for middleware auth checks.
  const token = req.cookies.get("auth-token")?.value ?? null;
  const role = req.cookies.get("auth-role")?.value ?? null;
  return { token, role };
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { token, role } = getTokenFromRequest(req);

  // ── Already authenticated → redirect away from auth pages ─────────────────
  if (PUBLIC_PATHS.includes(pathname)) {
    if (token && role) {
      if (pathname === "/admin/login" && role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (
        (pathname === "/login" || pathname === "/register") &&
        role !== "SUPER_ADMIN"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  // ── Admin routes — require SUPER_ADMIN ────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── Dashboard routes — require any authenticated user ─────────────────────
  if (pathname.startsWith("/dashboard") || pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/",
    "/assistants/:path*",
    "/campaigns/:path*",
    "/leads/:path*",
    "/calls/:path*",
    "/users/:path*",
    "/settings/:path*",
  ],
};
