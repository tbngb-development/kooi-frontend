"use client";

import { Popover, usePopoverClose } from "@/components/ui/Popover";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface SidebarProfileMenuProps {
  user: { name: string; email?: string | null } | null;
  roleLabel: string;
  tenantName: string;
  isLoggingOut: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
}

/**
 * Clickable profile row with sideways popover menu.
 * Contains: profile brief + Settings + Sign out.
 */
export function SidebarProfileMenu({
  user,
  roleLabel,
  tenantName,
  isLoggingOut,
  onLogout,
  onNavigate,
}: SidebarProfileMenuProps) {
  const initials = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <Popover
      placement="right"
      align="end"
      offset={15}
      className="w-full"
      panelClassName="w-64"
      trigger={
        <button
          type="button"
          aria-label="Open profile menu"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition-colors focus-ring cursor-pointer",
            "hover:bg-zinc-800/70",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-semibold text-brand-400">
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium leading-tight text-zinc-200">
              {user?.name ?? "User"}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
              {roleLabel}
            </p>
          </div>
          <ChevronRight size={14} className="shrink-0 text-zinc-500" />
        </button>
      }
    >
      <ProfileMenuContent
        user={user}
        roleLabel={roleLabel}
        tenantName={tenantName}
        isLoggingOut={isLoggingOut}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />
    </Popover>
  );
}

// ─── Popover content (isolated so it can consume usePopoverClose) ────────────
function ProfileMenuContent({
  user,
  roleLabel,
  tenantName,
  isLoggingOut,
  onLogout,
  onNavigate,
}: Omit<SidebarProfileMenuProps, "onLogout"> & { onLogout: () => void }) {
  const close = usePopoverClose();
  const initials = user?.name?.charAt(0).toUpperCase() ?? "U";

  const handleNavigate = () => {
    close();
    onNavigate?.();
  };

  return (
    <>
      {/* Profile brief */}
      <div className="flex items-center gap-3 border-b border-zinc-800 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-600/30 bg-brand-600/15 text-base font-semibold text-brand-400">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100">
            {user?.name ?? "User"}
          </p>
          {user?.email && (
            <p className="truncate text-xs text-zinc-400">{user.email}</p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="rounded bg-brand-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-400">
              {roleLabel}
            </span>
            <span className="truncate text-[10px] text-zinc-500">
              {tenantName}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-1.5">
        <Link
          href={APP_ROUTES.SETTINGS}
          role="menuitem"
          onClick={handleNavigate}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Settings size={15} />
          Settings
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            close();
            onLogout();
          }}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-300 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 cursor-pointer"
        >
          <LogOut size={15} />
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </>
  );
}
