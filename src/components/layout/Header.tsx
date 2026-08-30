"use client";

import { useAuthStore } from "@/store/authStore";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/campaigns": "Campaign Pipelines",
  "/assistants": "AI Voice Assistants",
  "/leads": "Contact Leads",
  "/calls": "Call Monitoring",
  "/users": "Workspace Members",
  "/settings": "Configuration Settings",
};

function getPageTitle(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  const matched = Object.keys(routeLabels).find(
    (key) => key !== "/dashboard" && pathname.startsWith(key),
  );
  return matched ? routeLabels[matched] : "System Hub";
}

export function Header() {
  const pathname = usePathname();
  const { user, memberships, activeTenantId } = useAuthStore();
  const title = getPageTitle(pathname);

  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );
  const activeRole = activeMembership?.role ?? "USER";

  return (
    <header className="h-14 border-b border-surface-border bg-surface flex items-center justify-between px-5 shrink-0 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
        {user?.isPlatformAdmin && (
          <span className="text-[10px] bg-error-50 border border-error-100 text-error-600 px-1.5 py-0.5 rounded font-mono font-bold tracking-wide">
            SYSTEM ROOT
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-placeholder hover:bg-surface-hover border border-surface-border hover:text-text-primary transition-colors"
          aria-label="Alert Messages"
        >
          <Bell size={15} />
        </button>

        <div className="flex items-center gap-2 border-l border-surface-border pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-base font-semibold">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-base font-semibold text-text-secondary leading-none">
              {user?.name}
            </span>
            <span className="text-[9px] text-text-placeholder capitalize mt-0.5 leading-none">
              {user?.isPlatformAdmin
                ? "Platform Admin"
                : activeRole.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
