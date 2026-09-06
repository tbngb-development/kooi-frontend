"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLogout } from "@/hooks/admin/useAdminAuth";
import { useAuthStore } from "@/store/authStore";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { Popover, usePopoverClose } from "@/components/ui/Popover";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Shield,
  Loader2,
  CreditCard,
  KeyRound,
  MailPlus,
  Users2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useAdminLogout();

  const links = [
    {
      name: "Dashboard",
      href: ADMIN_ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      name: "Tenants",
      href: ADMIN_ROUTES.TENANTS,
      icon: Building2,
    },
    {
      name: "Invites",
      href: ADMIN_ROUTES.INVITES,
      icon: MailPlus,
    },
    {
      name: "Payments",
      href: ADMIN_ROUTES.PAYMENTS,
      icon: CreditCard,
    },
    {
      name: "Users",
      href: ADMIN_ROUTES.USERS,
      icon: Users2,
    },
    { name: "Plans", href: ADMIN_ROUTES.PLANS, icon: CreditCard },
    { name: "API Keys", href: ADMIN_ROUTES.API_KEYS, icon: KeyRound },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 border-r border-surface-border bg-surface flex flex-col h-screen sticky top-0 shrink-0 z-30">
      {/* Brand Header */}
      <div className="h-16 border-b border-surface-border flex items-center px-6 gap-3 shrink-0">
        <div className="h-9 w-9 rounded-lg bg-error-50 border border-error-100 flex items-center justify-center text-error-600 shadow-sm shrink-0">
          <Shield size={18} className="stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-text-primary tracking-tight truncate">
            Kooi Admin
          </h1>
          <p className="text-xs text-error-600 font-semibold tracking-wider uppercase">
            Platform Ops
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto thin-scrollbar">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium transition-colors focus-ring",
                isActive
                  ? "bg-error-50/50 border border-error-100/50 text-error-700"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle",
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-error-600" : "text-text-muted",
                )}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Integrated Admin Profile Menu Popover */}
      <div className="border-t border-surface-border p-3 bg-surface-muted/30 shrink-0">
        <Popover
          placement="right"
          align="end"
          offset={16}
          className="w-full"
          panelClassName="w-64 bg-surface border border-surface-border text-text-primary shadow-2xl"
          trigger={
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-subtle focus-ring cursor-pointer text-left"
            >
              <div className="h-8 w-8 rounded-full bg-error-50 border border-error-100 flex items-center justify-center text-error-600 font-bold shrink-0 text-sm">
                {user?.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate leading-tight">
                  {user?.name ?? "Super Admin"}
                </p>
                <p className="text-[10px] text-error-600 font-bold tracking-wider uppercase mt-0.5">
                  Platform Admin
                </p>
              </div>
              <ChevronRight size={14} className="shrink-0 text-text-placeholder" />
            </button>
          }
        >
          <AdminProfilePopoverContent
            user={user}
            isLoggingOut={isLoggingOut}
            onLogout={handleLogout}
          />
        </Popover>
      </div>
    </aside>
  );
}

// ─── Pure Popover Content Component ─────────────────────────────────────────
interface AdminProfilePopoverContentProps {
  user: { name: string; email?: string | null } | null;
  isLoggingOut: boolean;
  onLogout: () => void;
}

function AdminProfilePopoverContent({
  user,
  isLoggingOut,
  onLogout,
}: AdminProfilePopoverContentProps) {
  const close = usePopoverClose();
  const initials = user?.name?.charAt(0).toUpperCase() ?? "A";

  const handleLogoutClick = () => {
    close();
    onLogout();
  };

  return (
    <div className="bg-surface text-text-primary rounded-xl overflow-hidden">
      {/* Mini Profile Brief */}
      <div className="flex items-center gap-3 border-b border-surface-subtle p-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-error-100 bg-error-50 text-base font-bold text-error-600">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            {user?.name ?? "Super Admin"}
          </p>
          <p className="truncate text-xs text-text-muted mt-0.5">
            {user?.email ?? "admin@kooi.io"}
          </p>
          <span className="mt-2 inline-block rounded bg-error-50 border border-error-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-error-600">
            System Operations
          </span>
        </div>
      </div>

      {/* Popover Actions */}
      <div className="p-1.5">
        <button
          type="button"
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-error-50 hover:text-error-600 disabled:opacity-50 cursor-pointer text-left font-medium"
        >
          {isLoggingOut ? (
            <Loader2 size={15} className="animate-spin text-error-600" />
          ) : (
            <LogOut size={15} className="text-text-muted group-hover:text-error-600" />
          )}
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}