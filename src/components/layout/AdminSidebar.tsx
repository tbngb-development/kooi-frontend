"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { useAdminLogout } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tenants", href: "/admin/tenants", icon: Building2 },
];

interface AdminSidebarContentProps {
  pathname: string;
  setMobileOpen: (open: boolean) => void;
  user: { name: string } | null;
  handleLogout: () => void;
  isLoggingOut: boolean;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useAdminLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const contentProps: AdminSidebarContentProps = {
    pathname,
    setMobileOpen,
    user,
    handleLogout,
    isLoggingOut: logoutMutation.isPending,
  };

  return (
    <>
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-surface border-r border-surface-border h-screen sticky top-0 shrink-0">
        <AdminSidebarContent {...contentProps} />
      </aside>

      {/* Mobile Menu Trigger */}
      <button
        className="lg:hidden fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-md bg-surface border border-surface-border shadow-sm text-text-muted hover:text-text-primary transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open Admin Menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-60 bg-surface border-r border-surface-border h-full shadow-lg">
            <button
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors z-10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close Admin Menu"
            >
              <X size={16} />
            </button>
            <AdminSidebarContent {...contentProps} />
          </aside>
        </div>
      )}
    </>
  );
}

// ─── Extracted Presentation Component ────────────────────────────────────────
function AdminSidebarContent({
  pathname,
  setMobileOpen,
  user,
  handleLogout,
  isLoggingOut,
}: AdminSidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-surface text-text-primary">
      {/* Header / Brand */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-surface-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-50 border border-error-100 text-error-600 shadow-sm shrink-0">
          <ShieldAlert size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-text-primary tracking-tight truncate leading-tight">
            Platform Admin
          </p>
          <p className="text-base text-error-600 font-mono uppercase tracking-wider leading-none mt-0.5">
            System Control
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 thin-scrollbar">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-150 border",
                    isActive
                      ? "bg-error-50 text-error-600 border-error-100 shadow-xs font-semibold"
                      : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  <Icon
                    size={16}
                    className={isActive ? "text-error-600" : "text-text-muted"}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin User Details & Logout */}
      <div className="border-t border-surface-border p-3 shrink-0 bg-surface-subtle">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-error-100 text-error-600 text-base font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-primary truncate leading-tight">
              {user?.name ?? "Administrator"}
            </p>
            <p className="text-[10px] text-error-600 font-mono font-bold uppercase tracking-wider mt-0.5">
              Root Access
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base text-text-muted hover:bg-error-50 hover:text-error-600 transition-colors duration-150 disabled:opacity-50"
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}