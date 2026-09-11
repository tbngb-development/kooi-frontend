"use client";

import { StatsCard } from "./StatsCard";
import { formatPaisa } from "@/lib/utils/formatMoney";
import type { DashboardOverview } from "@/types/dashboard";
import { BarChart3, Phone, Target, Users, Wallet, Flame } from "lucide-react";

interface Props {
  data: DashboardOverview;
}

export function OverviewCards({ data }: Props) {
  const { campaigns, wallet, leads, calls, spend, projections } = data;

  const qualificationPositive = leads.qualificationRate >= 15;
  const connectPositive = calls.connectRate >= 60;

  const daysLabel =
    projections.estimatedDaysRemaining === null
      ? "Sufficient balance"
      : `~${projections.estimatedDaysRemaining} days remaining`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
      <StatsCard
        title="Total Campaigns"
        value={campaigns.total}
        subtitle={`${campaigns.active} currently active`}
        icon={<Target size={18} strokeWidth={2.5} />}
        iconColor="bg-brand-50 text-brand-700 border-brand-100"
      />

      <StatsCard
        title="Wallet Balance"
        value={formatPaisa(wallet.totalBalancePaisa)}
        subtitle={`${formatPaisa(wallet.cashBalancePaisa)} cash · ${formatPaisa(wallet.bonusBalancePaisa)} bonus`}
        icon={<Wallet size={18} strokeWidth={2.5} />}
        iconColor="bg-secondary-50 text-secondary-700 border-secondary-200"
        trend={{ value: daysLabel, positive: true }}
      />

      <StatsCard
        title="Total Leads"
        value={leads.total.toLocaleString("en-IN")}
        subtitle={`${leads.qualified.toLocaleString("en-IN")} officially qualified`}
        icon={<Users size={18} strokeWidth={2.5} />}
        iconColor="bg-info-50 text-info-700 border-info-200"
        trend={{
          value: `${leads.qualificationRate.toFixed(1)}% qualification rate`,
          positive: qualificationPositive,
        }}
      />

      <StatsCard
        title="Dialed Calls"
        value={calls.total.toLocaleString("en-IN")}
        subtitle={`${calls.completed.toLocaleString("en-IN")} connected · ${calls.failed} failed`}
        icon={<Phone size={18} strokeWidth={2.5} />}
        iconColor="bg-indigo-50 text-indigo-700 border-indigo-200"
        trend={{
          value: `${calls.connectRate.toFixed(1)}% connect rate`,
          positive: connectPositive,
        }}
      />

      <StatsCard
        title="Total Expenditure"
        value={formatPaisa(spend.totalPaisa)}
        subtitle={`Avg ${formatPaisa(spend.avgCostPerQualifiedLeadPaisa)} / qual. lead`}
        icon={<BarChart3 size={18} strokeWidth={2.5} />}
        iconColor="bg-purple-50 text-purple-700 border-purple-200"
      />

      <StatsCard
        title="Daily Burn Rate"
        value={formatPaisa(projections.dailyBurnRatePaisa)}
        subtitle="Estimated daily depletion"
        icon={<Flame size={18} strokeWidth={2.5} />}
        iconColor="bg-hot-bg text-hot-text border-hot-border"
        trend={{
          value: daysLabel,
          positive:
            projections.estimatedDaysRemaining === null ||
            projections.estimatedDaysRemaining > 7,
        }}
      />
    </div>
  );
}
