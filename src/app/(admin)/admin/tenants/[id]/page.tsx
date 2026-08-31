"use client";

import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTenant,
  useTenantStats,
  useToggleTenantStatus,
} from "@/hooks/admin/useAdminTenants";
import { useAdminCampaigns } from "@/hooks/admin/useAdminCampaigns";
import { useAdminCalls } from "@/hooks/admin/useAdminCalls";
import { useAdminAssistants } from "@/hooks/admin/useAdminAssistants";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  PhoneCall,
  LayoutDashboard,
  ToggleLeft,
  ToggleRight,
  Star,
} from "lucide-react";
import GoBackButton from "@/components/ui/GoBackButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenantDetailPage({ params }: PageProps) {
  const { id: tenantId } = use(params);
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "campaigns" | "calls" | "assistants"
  >("campaigns");

  const {
    data: tenant,
    isLoading: isTenantLoading,
    isFetching: isTenantFetching,
  } = useTenant(tenantId);
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
  } = useTenantStats(tenantId);
  const { data: campaigns, isLoading: isCampaignsLoading } =
    useAdminCampaigns(tenantId);
  const { data: callsData, isLoading: isCallsLoading } = useAdminCalls({
    tenantId,
    limit: 10,
  });
  const { data: assistants, isLoading: isAssistantsLoading } =
    useAdminAssistants(tenantId);
  const { mutate: toggleStatus, isPending: isToggling } =
    useToggleTenantStatus();

  const isRefreshing = isTenantFetching || isMetricsFetching;

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: [...QUERY_KEYS.TENANTS.all, tenantId] });
  };

  const statCards = [
    {
      title: "Workspace Users",
      value: metrics?.stats.totalUsers ?? 0,
      icon: Building2,
      color: "text-info-600 bg-info-50 border-info-100",
    },
    {
      title: "Global Calls",
      value: metrics?.stats.totalCalls ?? 0,
      icon: PhoneCall,
      color: "text-brand-600 bg-brand-50 border-brand-100",
    },
    {
      title: "Active Campaigns",
      value: metrics?.stats.activeCampaigns ?? 0,
      icon: LayoutDashboard,
      color: "text-secondary-600 bg-secondary-50 border-secondary-100",
    },
    {
      title: "Qualification Rate",
      value: metrics ? `${metrics.stats.qualificationRate}%` : "0%",
      icon: Star,
      color: "text-warning-600 bg-warning-50 border-warning-100",
    },
  ];

  if (isTenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-error-600" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-text-muted">
        Organization instance could not be found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Navigation and Actions Row */}
      <div className="flex items-center justify-between">
        <GoBackButton />
        <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      </div>

      {/* Tenant Identity Header */}
      <Card className="p-6 bg-surface border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {tenant.name}
            </h1>
            <Badge
              variant={tenant.isActive ? "success" : "error"}
              className="capitalize"
            >
              {tenant.isActive ? "Active Routing" : "Suspended"}
            </Badge>
          </div>
          <p className="text-xs text-text-placeholder font-mono mt-1">
            {tenant.id}
          </p>
        </div>

        <button
          onClick={() =>
            toggleStatus({ id: tenant.id, isActive: !tenant.isActive })
          }
          disabled={isToggling}
          className={`flex items-center gap-1.5 px-4 h-11 rounded-lg border text-sm font-semibold transition-all focus-ring cursor-pointer hover:shadow-sm disabled:opacity-50 ${
            tenant.isActive
              ? "bg-error-50 border-error-100 text-error-700 hover:bg-error-100/70"
              : "bg-brand-50 border-brand-100 text-brand-700 hover:bg-brand-100/70"
          }`}
        >
          {tenant.isActive ? (
            <>
              <ToggleRight size={16} className="stroke-[2.5]" />
              <span>Suspend Workspace</span>
            </>
          ) : (
            <>
              <ToggleLeft size={16} className="stroke-[2.5]" />
              <span>Activate Workspace</span>
            </>
          )}
        </button>
      </Card>

      {/* Workspace Metric Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="p-4 flex items-start gap-3">
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
                  {isMetricsLoading ? (
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

      {/* Tab Filter System */}
      <div className="space-y-4">
        <div className="flex border-b border-surface-border">
          {(
            [
              {
                key: "campaigns",
                label: `Campaigns (${campaigns?.length ?? 0})`,
              },
              {
                key: "calls",
                label: `System Calls (${callsData?.calls.length ?? 0})`,
              },
              {
                key: "assistants",
                label: `Assign Assistants (${assistants?.length ?? 0})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-error-600 text-error-700 font-extrabold"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <Card className="p-5 border border-surface-border bg-surface rounded-xl">
          {activeTab === "campaigns" && (
            <div>
              {isCampaignsLoading ? (
                <div className="p-8 flex justify-center">
                  <Spinner className="text-error-600" />
                </div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  No campaigns created.
                </div>
              ) : (
                <div className="overflow-x-auto thin-scrollbar">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-text-secondary font-semibold">
                        <th className="py-2 pb-3">Campaign</th>
                        <th className="py-2 pb-3">Routing State</th>
                        <th className="py-2 pb-3 text-right">Leads</th>
                        <th className="py-2 pb-3 text-right">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                      {campaigns.map((camp) => (
                        <tr key={camp.id}>
                          <td className="py-3.5">
                            <p className="font-semibold">{camp.name}</p>
                            <p className="text-xs text-text-placeholder font-mono truncate max-w-sm">
                              {camp.id}
                            </p>
                          </td>
                          <td className="py-3.5">
                            <Badge
                              variant={
                                camp.status === "RUNNING" ? "info" : "default"
                              }
                            >
                              {camp.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right font-mono">
                            {camp.totalLeads}
                          </td>
                          <td className="py-3.5 text-right font-mono text-text-secondary">
                            {camp.completedLeads} / {camp.totalLeads}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "calls" && (
            <div>
              {isCallsLoading ? (
                <div className="p-8 flex justify-center">
                  <Spinner className="text-error-600" />
                </div>
              ) : !callsData || callsData.calls.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  No dialogue logs found.
                </div>
              ) : (
                <div className="overflow-x-auto thin-scrollbar">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-text-secondary font-semibold">
                        <th className="py-2 pb-3">Call ID</th>
                        <th className="py-2 pb-3">Dialogue Status</th>
                        <th className="py-2 pb-3 text-right">Duration</th>
                        <th className="py-2 pb-3 text-right">
                          Processing Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                      {callsData.calls.map((call) => (
                        <tr key={call.id}>
                          <td className="py-3.5 font-mono text-xs">
                            {call.id}
                          </td>
                          <td className="py-3.5">
                            <Badge
                              variant={
                                call.status === "COMPLETED"
                                  ? "success"
                                  : "error"
                              }
                            >
                              {call.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right font-mono">
                            {call.duration ? `${call.duration}s` : "--"}
                          </td>
                          <td className="py-3.5 text-right font-mono font-semibold text-text-secondary">
                            {call.cost ? `$${call.cost.toFixed(3)}` : "$0.000"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "assistants" && (
            <div>
              {isAssistantsLoading ? (
                <div className="p-8 flex justify-center">
                  <Spinner className="text-error-600" />
                </div>
              ) : !assistants || assistants.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  No assistants assigned.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assistants.map((ast) => (
                    <div
                      key={ast.id}
                      className="p-4 border border-surface-border rounded-lg bg-surface-muted flex items-start gap-3"
                    >
                      <div className="h-9 w-9 bg-error-50 border border-error-100 flex items-center justify-center rounded-lg text-error-600 shrink-0">
                        <Star size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-text-primary text-sm">
                          {ast.name}
                        </p>
                        <p className="text-[10px] text-text-placeholder font-mono mt-0.5 truncate">
                          {ast.id}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          Bolna Agent Ref:{" "}
                          <span className="font-mono text-[10px] bg-surface-subtle border border-surface-border px-1.5 py-0.5 rounded text-text-muted">
                            {ast.bolnaId}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
