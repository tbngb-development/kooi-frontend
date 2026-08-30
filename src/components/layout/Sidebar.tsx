"use client";

import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import {
  BarChart3,
  Bot,
  LogOut,
  Menu,
  Phone,
  Settings,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Campaigns", href: "/campaigns", icon: Target },
  { label: "Assistants", href: "/assistants", icon: Bot },
  // { label: "Leads", href: "/leads", icon: Users },
  { label: "Call History", href: "/call-history", icon: Phone },
  { label: "Team", href: "/users", icon: Users, adminOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarContentProps {
  tenantName: string;
  visibleItems: NavItem[];
  pathname: string;
  setMobileOpen: (open: boolean) => void;
  user: { name: string } | null;
  isPlatformAdmin: boolean;
  activeRole: string | null;
  handleLogoutClick: () => void;
  isLoggingOut: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, memberships, activeTenantId } = useAuthStore();
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  // V1 structural resolution helpers
  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );
  const activeRole = activeMembership?.role ?? null;
  const isPlatformAdmin = user?.isPlatformAdmin ?? false;

  const tenantName = activeMembership?.tenantName ?? "LeadAI Workspace";

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.adminOnly) return true;
    return activeRole === "ADMIN" || activeRole === "OWNER" || isPlatformAdmin;
  });

  const handleLogoutClick = () => {
    logoutMutation.mutate();
  };

  const contentProps: SidebarContentProps = {
    tenantName,
    visibleItems,
    pathname,
    setMobileOpen,
    user,
    isPlatformAdmin,
    activeRole,
    handleLogoutClick,
    isLoggingOut: logoutMutation.isPending,
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 shrink-0">
        <SidebarContent {...contentProps} />
      </aside>

      {/* Mobile Header Menu Activation */}
      <button
        className="lg:hidden fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 shadow-sm text-zinc-400"
        onClick={() => setMobileOpen(true)}
        aria-label="Open Workspace Menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-56 bg-zinc-900 h-full shadow-lg">
            <button
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 z-10"
              onClick={() => setMobileOpen(false)}
            >
              <X size={16} />
            </button>
            <SidebarContent {...contentProps} />
          </aside>
        </div>
      )}
    </>
  );
}

// ─── Pure Presentation Layer ──────────────────────────────────────────────────
function SidebarContent({
  tenantName,
  visibleItems,
  pathname,
  setMobileOpen,
  user,
  isPlatformAdmin,
  activeRole,
  handleLogoutClick,
  isLoggingOut,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100">
      {/* Logo Section */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-zinc-800 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-lg shadow-brand-900/30">
          <Zap size={16} className="text-white fill-white" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-zinc-100 truncate leading-none">
            {tenantName}
          </p>
          <p className="text-base text-zinc-400 mt-1 leading-none">
            AI Agent Hub
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="flex flex-col gap-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-150",
                    isActive
                      ? "bg-zinc-800 text-brand-400 shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100",
                  )}
                >
                  <Icon
                    size={16}
                    className={isActive ? "text-brand-400" : "text-zinc-400"}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Information & Session Termination */}
      <div className="border-t border-zinc-800 p-3 shrink-0 bg-zinc-950/40">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-850 border border-zinc-750 text-brand-400 text-base font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-base font-medium text-zinc-200 truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
              {isPlatformAdmin ? "PLATFORM ADMIN" : activeRole?.toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors duration-150 disabled:opacity-50"
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
