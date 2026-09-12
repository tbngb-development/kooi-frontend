"use client";

import { useState } from "react";
import {
  User as UserIcon,
  KeyRound,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { ProfileWorkspaceTab } from "@/components/settings/ProfileWorkspaceTab";
import { SecurityTab } from "@/components/settings/SecurityTab";

type TabKey = "profile" | "security";

interface TabDefinition {
  key: TabKey;
  label: string;
  description: string;
  icon: React.ElementType;
}

const TABS: TabDefinition[] = [
  {
    key: "profile",
    label: "Profile & Workspace",
    description: "Identity and active workspace configuration",
    icon: UserIcon,
  },
  {
    key: "security",
    label: "Security & Access",
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

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8">
      {/* Dashboard Style Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Settings size={24} className="text-brand-600" />
            Account Settings
          </h1>
          <p className="text-sm font-medium text-text-muted mt-1">
            Manage your personal profile, workspace identity, and security
            credentials.
          </p>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 text-xs bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg shadow-xs">
          <ShieldCheck size={14} className="text-brand-600" />
          <span className="text-brand-700 font-bold uppercase tracking-wider">
            {isPlatformAdmin ? "Platform Admin" : activeRole}
          </span>
        </div>
      </div>

      {/* Navigation Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <nav className="lg:w-72 shrink-0">
          <ul className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <li key={tab.key} className="shrink-0 lg:shrink">
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-3 w-full text-left px-3.5 py-3 rounded-lg transition-all duration-150 border focus-ring",
                      isActive
                        ? "bg-surface border-surface-border text-brand-700 shadow-sm"
                        : "border-transparent text-text-secondary hover:bg-surface hover:border-surface-border hover:shadow-xs",
                    )}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive ? "text-brand-600" : "text-text-muted"
                      }
                    />
                    <div className="min-w-0 hidden lg:block">
                      <p
                        className={cn(
                          "text-sm font-bold leading-tight",
                          isActive ? "text-brand-700" : "text-text-primary",
                        )}
                      >
                        {tab.label}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 truncate font-medium">
                        {tab.description}
                      </p>
                    </div>
                    <span className="lg:hidden text-sm font-bold">
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
            <div className="px-6 py-4 border-b border-surface-border bg-surface-subtle">
              <div className="flex items-center gap-2">
                <currentTab.icon size={18} className="text-text-muted" />
                <h2 className="text-base font-bold text-text-primary">
                  {currentTab.label}
                </h2>
              </div>
              <p className="text-sm font-medium text-text-muted mt-1">
                {currentTab.description}
              </p>
            </div>

            <div className="p-6">
              {activeTab === "profile" && <ProfileWorkspaceTab />}
              {activeTab === "security" && <SecurityTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
