"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLogout } from "@/hooks/admin/useAdminAuth";
import { useAuthStore } from "@/store/authStore";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Shield,
  Loader2,
  User,
  CreditCard,
  KeyRound,
  MailPlus,
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
    { name: "Plans", href: ADMIN_ROUTES.PLANS, icon: CreditCard },
    { name: "API Keys", href: ADMIN_ROUTES.API_KEYS, icon: KeyRound },
  ];

  return (
    <aside className="w-64 border-r border-surface-border bg-surface flex flex-col h-screen sticky top-0">
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

      {/* Navigation */}
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
                  isActive
                    ? "text-error-600"
                    : "text-text-muted group-hover:text-text-secondary",
                )}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Context Footer */}
      <div className="border-t border-surface-border p-4 bg-surface-muted/50 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0 px-2">
          <div className="h-9 w-9 rounded-full bg-surface-subtle border border-surface-border flex items-center justify-center text-text-secondary shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary truncate">
              {user?.name ?? "Super Admin"}
            </p>
            <p className="text-xs text-text-muted truncate">
              {user?.email ?? "admin@system.com"}
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-text-secondary border border-surface-border bg-surface hover:bg-surface-subtle transition-all disabled:opacity-50 focus-ring cursor-pointer"
        >
          {isLoggingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
          <span>Close Session</span>
        </button>
      </div>
    </aside>
  );
}
