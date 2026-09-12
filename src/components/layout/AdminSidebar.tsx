"use client";

import { AdminSidebarLogo } from "@/components/layout/sidebar/AdminSidebarLogo";
import { Popover, usePopoverClose } from "@/components/ui/Popover";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { useAdminLogout } from "@/hooks/admin/useAdminAuth";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/authStore";
import {
  Building2,
  ChevronRight,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  MailPlus,
  Menu,
  Users2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ADMIN_LINKS = [
  { name: "Dashboard", href: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: "Tenants", href: ADMIN_ROUTES.TENANTS, icon: Building2 },
  { name: "Invites", href: ADMIN_ROUTES.INVITES, icon: MailPlus },
  { name: "Payments", href: ADMIN_ROUTES.PAYMENTS, icon: CreditCard },
  { name: "Users", href: ADMIN_ROUTES.USERS, icon: Users2 },
  { name: "Plans", href: ADMIN_ROUTES.PLANS, icon: CreditCard },
  { name: "API Keys", href: ADMIN_ROUTES.API_KEYS, icon: KeyRound },
];

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useAdminLogout();

  const handleLogout = () => logout();
  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100">
      <AdminSidebarLogo />

      <nav className="flex-1 overflow-y-auto thin-scrollbar px-3 py-5 space-y-1">
        {ADMIN_LINKS.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className={cn(
                "group flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-semibold transition-all duration-200 focus-ring",
                isActive
                  ? "bg-error-600/15 border border-error-500/30 text-error-300 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-transparent",
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-error-400"
                    : "text-zinc-500 group-hover:text-zinc-300",
                )}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3 shrink-0 bg-zinc-950/40">
        <Popover
          placement="right"
          align="end"
          offset={16}
          className="w-full"
          panelClassName="w-64 bg-surface border border-surface-border text-text-primary shadow-2xl"
          trigger={
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-zinc-800 border border-transparent hover:border-zinc-700 focus-ring cursor-pointer text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error-500/15 border border-error-500/30 text-error-300 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-100 truncate leading-tight group-hover:text-error-300 transition-colors">
                  {user?.name ?? "Super Admin"}
                </p>
                <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5 truncate">
                  System Admin
                </p>
              </div>
              <ChevronRight
                size={14}
                className="shrink-0 text-zinc-600 group-hover:text-error-400 transition-colors"
              />
            </button>
          }
        >
          <AdminProfilePopoverContent
            user={user}
            isLoggingOut={isLoggingOut}
            onLogout={handleLogout}
            onCloseMobile={closeMobile}
          />
        </Popover>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile trigger */}
      <button
        className="lg:hidden fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 shadow-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        onClick={() => setMobileOpen(true)}
        aria-label="Open Admin Menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={closeMobile}
          />
          <aside className="relative flex flex-col w-64 bg-zinc-900 h-full shadow-2xl border-r border-zinc-800 animate-[slideIn_0.2s_ease-out]">
            <button
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 z-10 focus-ring"
              onClick={closeMobile}
              aria-label="Close Admin Menu"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// ─── Profile popover (light panel on dark sidebar) ──────────────────────────
interface AdminProfilePopoverContentProps {
  user: { name: string; email?: string | null } | null;
  isLoggingOut: boolean;
  onLogout: () => void;
  onCloseMobile: () => void;
}

function AdminProfilePopoverContent({
  user,
  isLoggingOut,
  onLogout,
  onCloseMobile,
}: AdminProfilePopoverContentProps) {
  const closePopover = usePopoverClose();
  const initials = user?.name?.charAt(0).toUpperCase() ?? "A";

  const handleLogoutClick = () => {
    closePopover();
    onCloseMobile();
    onLogout();
  };

  return (
    <div className="bg-zinc-900 text-zinc-100 rounded-xl overflow-hidden flex flex-col border border-zinc-800 shadow-2xl">
      {/* Mini Profile Brief */}
      <div className="flex items-center gap-3 border-b border-zinc-800 p-4 bg-zinc-950/60">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-error-500/40 bg-error-500/10 text-lg font-bold text-error-400 shadow-sm">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-zinc-100">
            {user?.name ?? "Super Admin"}
          </p>
          <p className="truncate text-xs text-zinc-400 mt-0.5 font-medium">
            {user?.email ?? "admin@kooi.io"}
          </p>
          <span className="mt-2 inline-block rounded-md bg-error-500/15 border border-error-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-error-300">
            Platform Operations
          </span>
        </div>
      </div>

      {/* Popover Actions */}
      <div className="p-2 bg-zinc-900">
        <button
          type="button"
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-all hover:bg-error-500/15 hover:text-error-300 disabled:opacity-50 cursor-pointer font-semibold"
        >
          {isLoggingOut ? (
            <Loader2
              size={16}
              className="animate-spin text-error-400 shrink-0"
            />
          ) : (
            <LogOut
              size={16}
              className="text-zinc-500 group-hover:text-error-400 shrink-0 transition-colors"
            />
          )}
          <span>{isLoggingOut ? "Ending Session..." : "Secure Logout"}</span>
        </button>
      </div>
    </div>
  );
}
