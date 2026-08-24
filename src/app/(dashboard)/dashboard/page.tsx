"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CampaignPerformance } from "@/components/dashboard/CampaignPerformance";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useDashboardOverview,
  useDashboardActivity,
  useDashboardCampaigns,
} from "@/hooks/useDashboard";
import { BarChart3, Phone, Target, Users } from "lucide-react";

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();
  const { data: campaigns, isLoading: campaignsLoading } =
    useDashboardCampaigns();

  if (overviewLoading) return <PageSpinner />;

  // ── Parse string rate from backend for comparison ─────────────────────────
  const qualificationRate = parseFloat(
    overview?.leads.qualificationRate ?? "0",
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Campaigns"
          value={overview?.campaigns.total ?? 0}
          subtitle={`${overview?.campaigns.active ?? 0} active`}
          icon={<Target size={18} />}
          iconColor="bg-brand-100 text-brand-600"
        />

        <StatsCard
          title="Total Leads"
          value={overview?.leads.total ?? 0}
          subtitle={`${overview?.leads.qualified ?? 0} qualified`}
          icon={<Users size={18} />}
          iconColor="bg-info-100 text-info-600"
        />

        <StatsCard
          title="Total Calls"
          value={overview?.calls.total ?? 0}
          subtitle={`${overview?.calls.completed ?? 0} completed`}
          icon={<Phone size={18} />}
          iconColor="bg-secondary-50 text-secondary-600"
        />

        <StatsCard
          title="Qualification Rate"
          value={overview?.leads.qualificationRate ?? "0%"}
          subtitle="Percentage of qualified leads"
          icon={<BarChart3 size={18} />}
          iconColor="bg-success-100 text-success-600"
          trend={{
            value: qualificationRate >= 50 ? "Above target" : "Below target",
            positive: qualificationRate >= 50,
          }}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Campaign performance */}
        <div className="xl:col-span-2">
          {campaignsLoading ? (
            <PageSpinner />
          ) : campaigns && campaigns.length > 0 ? (
            <CampaignPerformance campaigns={campaigns} />
          ) : (
            <EmptyState
              title="No campaigns yet"
              description="Create your first campaign to see performance data here."
              icon={<Target size={22} />}
            />
          )}
        </div>

        {/* Qualified leads feed */}
        <div>
          {activityLoading ? (
            <PageSpinner />
          ) : activity ? (
            <ActivityFeed data={activity} />
          ) : (
            <EmptyState
              title="No recent activity"
              description="Qualified leads from campaigns will appear here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
