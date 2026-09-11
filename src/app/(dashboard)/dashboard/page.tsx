"use client";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CallTrendsChart } from "@/components/dashboard/CallTrendsChart";
import { CampaignPerformance } from "@/components/dashboard/CampaignPerformance";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DispositionBreakdown } from "@/components/dashboard/DispositionBreakdown";
import { LeadFunnel } from "@/components/dashboard/LeadFunnel";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { SpendTrendsChart } from "@/components/dashboard/SpendTrendsChart";
import { TemperatureDistribution } from "@/components/dashboard/TemperatureDistribution";
import { TopCampaigns } from "@/components/dashboard/TopCampaigns";
import { PageSpinner, Spinner } from "@/components/ui/Spinner";
import {
  useDashboardOverview,
  useDashboardRecentActivity,
} from "@/hooks/useDashboard";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const { filters, setFilters, reset, apiFilters } = useDashboardFilters();

  const { data: overview, isLoading: overviewLoading } =
    useDashboardOverview(apiFilters);
  const { data: activity, isLoading: activityLoading } =
    useDashboardRecentActivity();

  return (
    <div className="flex flex-col gap-6 max-w-400 mx-auto pb-8">
      {/* ─── Header (full width, always on top) ─────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          Dashboard Overview
        </h1>
        <p className="text-sm font-medium text-text-muted mt-1">
          Real-time insights across campaigns, call telemetry, and wallet
          expenditure.
        </p>
      </div>

      {/* ─── Overview KPIs ──────────────────────────────────────── */}
      {overviewLoading || !overview ? (
        <div className="py-12">
          <PageSpinner />
        </div>
      ) : (
        <OverviewCards data={overview} />
      )}

      {/* ─── Filters (full width bar below header) ──────────────── */}
      <DashboardFilters value={filters} onChange={setFilters} onReset={reset} />

      {/* ─── Trends ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CallTrendsChart filters={apiFilters} />
        <SpendTrendsChart filters={apiFilters} />
      </div>

      {/* ─── Funnel + Outcomes + Temperature ────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LeadFunnel filters={apiFilters} />
        <DispositionBreakdown filters={apiFilters} />
        <TemperatureDistribution filters={apiFilters} />
      </div>

      {/* ─── Top Campaigns + Activity ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopCampaigns filters={apiFilters} />
        </div>
        <div className="flex flex-col h-full">
          {activityLoading ? (
            <div className="flex h-64 items-center justify-center bg-surface border border-surface-border rounded-xl">
              <Spinner className="text-brand-600" />
            </div>
          ) : activity ? (
            <ActivityFeed data={activity} />
          ) : null}
        </div>
      </div>

      {/* ─── Campaign Performance Table ─────────────────────────── */}
      <CampaignPerformance filters={apiFilters} />
    </div>
  );
}
