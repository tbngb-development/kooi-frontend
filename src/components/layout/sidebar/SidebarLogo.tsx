/* src/components/layout/sidebar/SidebarLogo.tsx */
"use client";

import Image from "next/image";
import Link from "next/link";

export function SidebarLogo() {
  return (
    <div className="flex items-center justify-center h-16 px-4 border-b border-zinc-800 shrink-0">
      <Link
        href="/dashboard"
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
