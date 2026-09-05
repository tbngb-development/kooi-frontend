"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  PhoneCall,
  Bot,
  Layers,
  Wallet,
  CreditCard,
} from "lucide-react";

interface AdminTenantNavProps {
  tenantId: string;
  tenantName: string;
}

const tabs = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: (id: string) => ADMIN_ROUTES.TENANT_DETAIL(id),
  },
  {
    key: "wallet",
    label: "Wallet",
    icon: Wallet,
    href: (id: string) => ADMIN_ROUTES.TENANT_WALLET(id),
  },
  {
    key: "payments",
    label: "Payments",
    icon: CreditCard,
    href: (id: string) => ADMIN_ROUTES.TENANT_PAYMENTS(id),
  },
  {
    key: "campaigns",
    label: "Campaigns",
    icon: Megaphone,
    href: (id: string) => ADMIN_ROUTES.TENANT_CAMPAIGNS(id),
  },
  {
    key: "leads",
    label: "Leads",
    icon: Users,
    href: (id: string) => ADMIN_ROUTES.TENANT_LEADS(id),
  },
  {
    key: "calls",
    label: "Calls",
    icon: PhoneCall,
    href: (id: string) => ADMIN_ROUTES.TENANT_CALLS(id),
  },
  {
    key: "assistants",
    label: "Assistants",
    icon: Bot,
    href: (id: string) => ADMIN_ROUTES.TENANT_ASSISTANTS(id),
  },
 
];

export function AdminTenantNav({ tenantId, tenantName }: AdminTenantNavProps) {
  const pathname = usePathname();

  const activeKey = (() => {
    if (pathname.includes("/wallet")) return "wallet";
    if (pathname.includes("/payments")) return "payments";
    if (pathname.includes("/campaigns")) return "campaigns";
    if (pathname.includes("/leads")) return "leads";
    if (pathname.includes("/calls")) return "calls";
    if (pathname.includes("/assistants")) return "assistants";
    return "overview";
  })();

  return (
    <div className="border-b border-surface-border bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider pt-4 pb-2">
          {tenantName}
        </p>
        <nav className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeKey === tab.key;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                href={tab.href(tenantId)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-error-600 text-error-700"
                    : "border-transparent text-text-muted hover:text-text-primary hover:border-surface-border",
                )}
              >
                <Icon size={15} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
