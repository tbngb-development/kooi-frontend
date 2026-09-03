"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Building2,
  Users,
  KeyRound,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { WorkspaceTab } from "@/components/settings/WorkspaceTab";
import { TeamTab } from "@/components/settings/TeamTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import BillingTab from "@/components/settings/BillingTab";

type TabKey = "profile" | "workspace" | "team" | "security" | "billing";

interface TabDefinition {
  key: TabKey;
  label: string;
  description: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const TABS: TabDefinition[] = [
  {
    key: "profile",
    label: "Profile",
    description: "Your personal account information",
    icon: UserIcon,
  },
  {
    key: "workspace",
    label: "Workspace",
    description: "Organization-level configuration",
    icon: Building2,
    adminOnly: true,
  },
  {
    key: "team",
    label: "Team Members",
    description: "Manage users and roles",
    icon: Users,
    adminOnly: true,
  },
  {
    key: "billing",
    label: "Billing & Ledger",
    description: "Wallet balance, recharges, and transactions",
    icon: CreditCard,
    adminOnly: true,
  },
  {
    key: "security",
    label: "Security",
    description: "Passwords and active sessions",
    icon: KeyRound,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const { memberships, activeTenantId, user } = useAuthStore();

  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );
  const activeRole = activeMembership?.role ?? "USER";
  const isPlatformAdmin = user?.isPlatformAdmin ?? false;
  const isPrivileged =
    activeRole === "OWNER" || activeRole === "ADMIN" || isPlatformAdmin;

  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isPrivileged);

  const currentTab =
    visibleTabs.find((t) => t.key === activeTab) ?? visibleTabs[0];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your account, workspace, and security preferences.
          </p>
        </div>

        {isPrivileged && (
          <div className="flex items-center gap-1.5 text-xs bg-brand-50 border border-brand-100 px-2.5 py-1.5 rounded-md">
            <ShieldCheck size={13} className="text-brand-600" />
            <span className="text-brand-700 font-semibold uppercase tracking-wide">
              {isPlatformAdmin ? "Platform Admin" : activeRole}
            </span>
          </div>
        )}
      </div>

      {/* Tabs Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation (Vertical on Desktop) */}
        <nav className="lg:w-64 shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <li key={tab.key} className="shrink-0 lg:shrink">
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md transition-all duration-150 border",
                      isActive
                        ? "bg-brand-50 border-brand-100 text-brand-700"
                        : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                    )}
                  >
                    <Icon
                      size={16}
                      className={
                        isActive ? "text-brand-600" : "text-text-muted"
                      }
                    />
                    <div className="min-w-0 hidden lg:block">
                      <p className="text-sm font-semibold leading-tight">
                        {tab.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5 truncate",
                          isActive ? "text-brand-600/70" : "text-text-muted",
                        )}
                      >
                        {tab.description}
                      </p>
                    </div>
                    <span className="lg:hidden text-xs font-medium">
                      {tab.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tab Content Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden">
            {/* Tab Header */}
            <div className="px-6 py-4 border-b border-surface-border bg-surface-subtle">
              <div className="flex items-center gap-2">
                {currentTab && (
                  <currentTab.icon size={16} className="text-text-muted" />
                )}
                <h2 className="text-base font-bold text-text-primary">
                  {currentTab?.label}
                </h2>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {currentTab?.description}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {activeTab === "profile" && <ProfileTab />}
              {activeTab === "workspace" && isPrivileged && <WorkspaceTab />}
              {activeTab === "team" && isPrivileged && <TeamTab />}
              {activeTab === "billing" && isPrivileged && <BillingTab />}
              {activeTab === "security" && <SecurityTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
