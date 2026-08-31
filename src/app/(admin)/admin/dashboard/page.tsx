"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminDashboardOverview,
  useAdminTenantsHealth,
  useAdminActivity,
} from "@/hooks/admin/useAdminDashboard";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  PhoneCall,
  Activity,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";

export default function AdminDashboardPage() {
  const qc = useQueryClient();

  const {
    data: overview,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
  } = useAdminDashboardOverview();
  const {
    data: health,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
  } = useAdminTenantsHealth();
  const {
    data: activity,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
  } = useAdminActivity(15);

  const isRefreshing =
    isOverviewFetching || isHealthFetching || isActivityFetching;

  const handleRefreshAll = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DASHBOARD.all });
  };

  const overviewCards = [
    {
      title: "Active Tenants",
      value: overview
        ? `${overview.activeTenants} / ${overview.totalTenants}`
        : "0",
      description: "Allocated organization instances",
      icon: Building2,
      color: "text-info-600 bg-info-50 border-info-100",
    },
    {
      title: "Platform Calls",
      value: overview?.totalCalls.toLocaleString() ?? "0",
      description: "Aggregated dialogue count",
      icon: PhoneCall,
      color: "text-brand-600 bg-brand-50 border-brand-100",
    },
    {
      title: "Audio Duration",
      value: overview
        ? `${Math.round(overview.totalDurationMinutes).toLocaleString()} m`
        : "0",
      description: "Active processing telemetry",
      icon: Clock,
      color: "text-secondary-600 bg-secondary-50 border-secondary-100",
    },
  ];

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Platform Operations
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Global orchestration and real-time infrastructure metrics.
          </p>
        </div>
        <div className="shrink-0">
          <RefreshButton
            onRefresh={handleRefreshAll}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {/* Overview Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overviewCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="p-5 flex items-start gap-4">
              <div
                className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight mt-1">
                  {isOverviewLoading ? (
                    <span className="inline-block w-16 h-6 bg-surface-subtle animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {card.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Administrative Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Status Monitoring */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">
              System Instance Health
            </h2>
          </div>

          <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
            {isHealthLoading ? (
              <div className="p-12 flex justify-center">
                <Spinner className="text-error-600" />
              </div>
            ) : !health || health.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                No instances found.
              </div>
            ) : (
              <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                      <th className="px-5 py-3">Workspace Instance</th>
                      <th className="px-5 py-3">Infrastructure Status</th>
                      <th className="px-5 py-3 text-right">Runs</th>
                      <th className="px-5 py-3 text-right">Calls (OK/Fail)</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                    {health.map((tenant) => (
                      <tr
                        key={tenant.tenantId}
                        className="hover:bg-surface-muted/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-text-primary">
                            {tenant.tenantName}
                          </p>
                          <p className="text-xs text-text-placeholder font-mono truncate max-w-[140px]">
                            {tenant.tenantId}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            variant={tenant.isActive ? "success" : "error"}
                            className="capitalize"
                          >
                            {tenant.isActive ? "Active Routing" : "Suspended"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right font-mono">
                          {tenant.totalCampaigns}
                        </td>
                        <td className="px-5 py-4 text-right font-mono">
                          <span className="text-text-primary font-semibold">
                            {tenant.totalCalls}
                          </span>{" "}
                          <span className="text-text-placeholder text-xs">
                            ({tenant.completedCalls}/{tenant.failedCalls})
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={ADMIN_ROUTES.TENANT_DETAIL(tenant.tenantId)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-error-600 hover:text-error-500 transition-colors focus-ring"
                          >
                            <span>Inspect</span>
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Live Event Stream */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-error-600 shrink-0" />
            <h2 className="text-base font-bold text-text-primary">
              Live Operations Feed
            </h2>
          </div>

          <Card className="p-5 h-[480px] overflow-y-auto thin-scrollbar bg-surface border border-surface-border flex flex-col gap-4 rounded-xl">
            {isActivityLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner className="text-error-600" />
              </div>
            ) : !activity || activity.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-text-muted">
                No active log records found.
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-surface-border">
                {activity.map((item) => {
                  let Icon = CheckCircle2;
                  let iconColor = "text-brand-600 bg-brand-50 border-brand-100";

                  if (item.type === "CALL_FAILED") {
                    Icon = XCircle;
                    iconColor = "text-error-600 bg-error-50 border-error-100";
                  } else if (item.type === "CAMPAIGN_STARTED") {
                    Icon = PlayCircle;
                    iconColor =
                      "text-secondary-600 bg-secondary-50 border-secondary-100";
                  }

                  return (
                    <div key={item.id} className="flex gap-3 relative min-w-0">
                      <div
                        className={`h-6.5 w-6.5 rounded-full border flex items-center justify-center shrink-0 z-10 ${iconColor}`}
                      >
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-text-secondary truncate">
                            {item.tenantName}
                          </span>
                          <span className="text-[10px] font-semibold text-text-placeholder shrink-0">
                            {formatDistanceToNow(new Date(item.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed break-words">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
