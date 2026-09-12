"use client";

import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { PageSpinner } from "@/components/ui/Spinner";
import { AdminDashboardFilters } from "@/components/admin/dashboard/AdminDashboardFilters";
import { AdminOverviewCards } from "@/components/admin/dashboard/AdminOverviewCards";
import { AdminRevenueTrends } from "@/components/admin/dashboard/AdminRevenueTrends";
import { AdminCallVolumeTrends } from "@/components/admin/dashboard/AdminCallVolumeTrends";
import { AdminTenantDistribution } from "@/components/admin/dashboard/AdminTenantDistribution";
import { AdminTopTenants } from "@/components/admin/dashboard/AdminTopTenants";
import { useAdminDashboardOverview } from "@/hooks/admin/useAdminDashboard";
import { useAdminDashboardFilters } from "@/hooks/admin/useAdminDashboardFilters";

export default function AdminDashboardPage() {
  const qc = useQueryClient();
  const { filters, setFilters, reset, apiFilters } = useAdminDashboardFilters();

  const { data: overview, isLoading: overviewLoading } =
    useAdminDashboardOverview(apiFilters);

  const isFetching = overviewLoading;

  const handleRefreshAll = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DASHBOARD.all });
  };

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Platform Operations
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Global orchestration and real-time infrastructure metrics.
          </p>
        </div>
        <RefreshButton onRefresh={handleRefreshAll} isRefreshing={isFetching} />
      </div>

      {/* ─── Overview KPIs ──────────────────────────────────────── */}
      {overviewLoading || !overview ? (
        <PageSpinner />
      ) : (
        <AdminOverviewCards data={overview} />
      )}

      {/* ─── Filters ────────────────────────────────────────────── */}
      <AdminDashboardFilters
        value={filters}
        onChange={setFilters}
        onReset={reset}
      />

      {/* ─── Trends ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AdminRevenueTrends filters={apiFilters} />
        <AdminCallVolumeTrends filters={apiFilters} />
      </div>

      {/* ─── Distribution + Top Tenants ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AdminTenantDistribution />
        <AdminTopTenants filters={apiFilters} />
      </div>
    </div>
  );
}
