"use client";

import { StatsCard } from "./StatsCard";
import { formatPaisa } from "@/lib/utils/formatMoney";
import type { DashboardOverview } from "@/types/dashboard";
import { BarChart3, Phone, Megaphone, Users } from "lucide-react";

interface Props {
  data: DashboardOverview;
}

export function OverviewCards({ data }: Props) {
  const { campaigns, leads, calls, spend } = data;

  const connectRate =
    calls.total > 0 ? (calls.completed / calls.total) * 100 : 0;

  const qualificationPositive = leads.qualificationRate >= 15;
  const connectPositive = connectRate >= 60;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Total Campaigns"
        value={campaigns.total.toLocaleString("en-IN")}
        subtitle={`${campaigns.active.toLocaleString("en-IN")} active`}
        icon={<Megaphone size={18} />}
        iconColor="bg-brand-100 text-brand-600"
      />

      <StatsCard
        title="Total Leads"
        value={leads.total.toLocaleString("en-IN")}
        subtitle={`${leads.qualified.toLocaleString("en-IN")} qualified · ${leads.notQualified.toLocaleString("en-IN")} unqualified`}
        icon={<Users size={18} />}
        iconColor="bg-info-100 text-info-600"
        trend={{
          value: `${leads.qualificationRate.toFixed(1)}% qualification rate`,
          positive: qualificationPositive,
        }}
      />

      <StatsCard
        title="Total Calls"
        value={calls.total.toLocaleString("en-IN")}
        subtitle={`${calls.completed.toLocaleString("en-IN")} completed · ${calls.failed.toLocaleString("en-IN")} failed`}
        icon={<Phone size={18} />}
        iconColor="bg-secondary-50 text-secondary-600"
        trend={{
          value: `${connectRate.toFixed(1)}% connect rate`,
          positive: connectPositive,
        }}
      />

      <StatsCard
        title="Total Spend"
        value={formatPaisa(spend.totalPaisa)}
        subtitle={`Avg ${formatPaisa(spend.avgCostPerQualifiedLeadPaisa)} / qualified lead`}
        icon={<BarChart3 size={18} />}
        iconColor="bg-accent-100 text-accent-600"
      />
    </div>
  );
}
