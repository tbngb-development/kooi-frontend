"use client";

import Image from "next/image";
import Link from "next/link";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";

/**
 * Admin brand mark — white logo on dark sidebar header.
 */
export function AdminSidebarLogo() {
  return (
    <div className="flex items-center justify-center h-16 px-4 border-b border-zinc-800 shrink-0">
      <Link
        href={ADMIN_ROUTES.DASHBOARD}
        className="flex items-center justify-center w-full h-full"
      >
        <Image
          src="/logo/logo-text-white.png"
          alt="Brand Logo"
          width={160}
          height={40}
          priority
          className="h-28 w-full object-contain object-left"
        />
      </Link>
    </div>
  );
}
