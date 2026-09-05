"use client";

import { use } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTenant,
  useTenantStats,
  useToggleTenantStatus,
} from "@/hooks/admin/useAdminTenants";
import { useAdminCampaigns } from "@/hooks/admin/useAdminCampaigns";
import { useAdminLeads } from "@/hooks/admin/useAdminLeads";
import { useAdminCalls } from "@/hooks/admin/useAdminCalls";
import { useAdminAssistants } from "@/hooks/admin/useAdminAssistants";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  PhoneCall,
  Megaphone,
  Users,
  Star,
  Bot,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenantDetailPage({ params }: PageProps) {
  const { id: tenantId } = use(params);
  const qc = useQueryClient();

  const { data: tenant, isLoading, isFetching } = useTenant(tenantId);
  const { data: metrics, isFetching: isMetricsFetching } =
    useTenantStats(tenantId);
  const { data: campaigns } = useAdminCampaigns(tenantId);
  const { data: leadsData } = useAdminLeads({ tenantId, limit: 1 });
  const { data: callsData } = useAdminCalls({ tenantId, limit: 1 });
  const { data: assistants } = useAdminAssistants(tenantId);
  const { mutate: toggleStatus, isPending: isToggling } =
    useToggleTenantStatus();

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: [...QUERY_KEYS.TENANTS.all, tenantId] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-error-600" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-text-muted">Tenant not found.</div>
    );
  }

  const statCards = [
    {
      title: "Users",
      value: metrics?.stats.totalUsers ?? 0,
      icon: Building2,
      color: "text-info-600 bg-info-50 border-info-100",
    },
    {
      title: "Total Calls",
      value: metrics?.stats.totalCalls ?? 0,
      icon: PhoneCall,
      color: "text-brand-600 bg-brand-50 border-brand-100",
    },
    {
      title: "Active Campaigns",
      value: metrics?.stats.activeCampaigns ?? 0,
      icon: Megaphone,
      color: "text-secondary-600 bg-secondary-50 border-secondary-100",
    },
    {
      title: "Qualification Rate",
      value: metrics ? `${metrics.stats.qualificationRate}%` : "—",
      icon: Star,
      color: "text-warning-600 bg-warning-50 border-warning-100",
    },
  ];

  const quickLinks = [
    {
      label: "Campaigns",
      count: campaigns?.length ?? 0,
      href: ADMIN_ROUTES.TENANT_CAMPAIGNS(tenantId),
      icon: Megaphone,
    },
    {
      label: "Leads",
      count: leadsData?.pagination.total ?? 0,
      href: ADMIN_ROUTES.TENANT_LEADS(tenantId),
      icon: Users,
    },
    {
      label: "Calls",
      count: callsData?.pagination.total ?? 0,
      href: ADMIN_ROUTES.TENANT_CALLS(tenantId),
      icon: PhoneCall,
    },
    {
      label: "Assistants",
      count: assistants?.length ?? 0,
      href: ADMIN_ROUTES.TENANT_ASSISTANTS(tenantId),
      icon: Bot,
    },
    
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant.name} />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title={tenant.name}
          description={`Instance ID: ${tenant.id}`}
          backHref={ADMIN_ROUTES.TENANTS}
          onRefresh={handleRefresh}
          isRefreshing={isFetching || isMetricsFetching}
          actions={
            <button
              onClick={() =>
                toggleStatus({ id: tenant.id, isActive: !tenant.isActive })
              }
              disabled={isToggling}
              className={`flex items-center gap-1.5 px-4 h-9 rounded-lg border text-sm font-semibold transition-all focus-ring cursor-pointer disabled:opacity-50 ${
                tenant.isActive
                  ? "bg-error-50 border-error-100 text-error-700 hover:bg-error-100/70"
                  : "bg-brand-50 border-brand-100 text-brand-700 hover:bg-brand-100/70"
              }`}
            >
              {tenant.isActive ? (
                <>
                  <ToggleRight size={15} /> Suspend
                </>
              ) : (
                <>
                  <ToggleLeft size={15} /> Activate
                </>
              )}
            </button>
          }
        />

        <div className="flex items-center gap-2">
          <Badge
            variant={tenant.isActive ? "success" : "error"}
            dot
            animate={tenant.isActive}
          >
            {tenant.isActive ? "Active Routing" : "Suspended"}
          </Badge>
          <span className="text-xs text-text-placeholder">
            Created {new Date(tenant.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i} className="p-4 flex items-start gap-3">
                <div
                  className={`h-10 w-10 border rounded-lg flex items-center justify-center shrink-0 ${card.color}`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                    {card.title}
                  </p>
                  <h3 className="text-lg font-bold text-text-primary tracking-tight mt-0.5">
                    {isMetricsFetching ? (
                      <span className="inline-block w-12 h-5 bg-surface-subtle animate-pulse rounded" />
                    ) : (
                      card.value
                    )}
                  </h3>
                </div>
              </Card>
            );
          })}
        </div>

        <h2 className="text-base font-bold text-text-primary">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-center justify-between p-4 rounded-xl border border-surface-border bg-surface hover:border-error-200 hover:bg-error-50/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className="text-text-muted group-hover:text-error-600 transition-colors"
                  />
                  <span className="text-sm font-semibold text-text-primary">
                    {link.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {link.count !== null && (
                    <span className="text-xs font-mono font-bold text-text-muted">
                      {link.count}
                    </span>
                  )}
                  <ArrowRight
                    size={14}
                    className="text-text-placeholder group-hover:text-error-600 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
