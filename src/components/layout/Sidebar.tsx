"use client";

import { SidebarLogo } from "@/components/layout/sidebar/SidebarLogo";
import {
  SidebarNav,
  type SidebarNavItem,
} from "@/components/layout/sidebar/SidebarNav";
import { SidebarProfileMenu } from "@/components/layout/sidebar/SidebarProfileMenu";
import { SidebarWalletCard } from "@/components/layout/sidebar/SidebarWalletCard";
import { RechargeModal } from "@/components/wallet/RechargeModal";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import {
  BarChart3,
  Bot,
  Megaphone,
  Menu,
  Phone,
  Settings,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Assistants", href: "/assistants", icon: Bot },
  { label: "Call History", href: "/call-history", icon: Phone },
  { label: "Team", href: "/users", icon: Users, adminOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, memberships, activeTenantId } = useAuthStore();
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  // ── Derive tenant/role ──
  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );
  const activeRole = activeMembership?.role ?? null;
  const isPlatformAdmin = user?.isPlatformAdmin ?? false;
  const tenantName = activeMembership?.tenantName ?? "LeadAI Workspace";

  const roleLabel = isPlatformAdmin
    ? "Platform Admin"
    : activeRole
      ? activeRole.charAt(0) + activeRole.slice(1).toLowerCase()
      : "Member";

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.adminOnly) return true;
    return activeRole === "ADMIN" || activeRole === "OWNER" || isPlatformAdmin;
  });

  // ── Handlers ──
  const closeMobile = () => setMobileOpen(false);

  const handleOpenRecharge = () => {
    setMobileOpen(false); // close drawer first to avoid z-index conflicts
    setRechargeOpen(true);
  };

  const handleLogout = () => logoutMutation.mutate();

  // ── Shared inner content ──
  const inner = (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100">
      <SidebarLogo tenantName={tenantName} />
      <SidebarNav
        items={visibleItems}
        pathname={pathname}
        onNavigate={closeMobile}
      />

      <div className="border-t border-zinc-800 p-3 shrink-0 bg-zinc-950/40 space-y-2">
        <SidebarWalletCard onRechargeClick={handleOpenRecharge} />
        <SidebarProfileMenu
          user={user}
          roleLabel={roleLabel}
          tenantName={tenantName}
          isLoggingOut={logoutMutation.isPending}
          onLogout={handleLogout}
          onNavigate={closeMobile}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 shrink-0">
        {inner}
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 shadow-sm text-zinc-400"
        onClick={() => setMobileOpen(true)}
        aria-label="Open Workspace Menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <aside className="relative flex flex-col w-60 bg-zinc-900 h-full shadow-lg">
            <button
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 z-10"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            {inner}
          </aside>
        </div>
      )}

      {/* Recharge Modal (single instance, shared) */}
      <RechargeModal
        isOpen={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
      />
    </>
  );
}
