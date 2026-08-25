// src/app/admin/not-found.tsx

import Link from "next/link";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import GoBackButton from "@/components/ui/GoBackButton";

export default function AdminNotFound() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto">
        {/* Rotating squares */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl border-2 border-surface-border rotate-6 transition-transform duration-500 hover:rotate-0" />
          <div className="absolute inset-0 rounded-2xl border-2 border-brand-200 -rotate-6 transition-transform duration-500 hover:rotate-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-brand-400 animate-pulse" />
          </div>
        </div>

        <span className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-text-primary/12 to-transparent select-none leading-none mb-3">
          404
        </span>

        <h1 className="text-lg font-bold text-text-primary mb-2 tracking-tight">
          Page Not Found
        </h1>

        <p className="text-base text-text-muted leading-relaxed mb-6 max-w-xs">
          This page doesn&apos;t exist in the admin panel. It may have been
          moved or removed.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href={ADMIN_ROUTES.DASHBOARD}
            className="
              inline-flex items-center gap-2
              px-4 py-2
              text-base font-medium
              text-white bg-brand-500
              rounded-lg shadow-xs
              hover:bg-brand-600
              transition-all duration-200
            "
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>

          <GoBackButton className="px-4 py-2" />
        </div>
      </div>
    </div>
  );
}