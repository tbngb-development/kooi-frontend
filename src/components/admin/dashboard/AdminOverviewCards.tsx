"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatPaisa } from "@/lib/utils/formatMoney";
import type { AdminOverview } from "@/types/admin-dashboard";
import {
  Building2,
  PhoneCall,
  Clock,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";

interface Props {
  data: AdminOverview;
}

export function AdminOverviewCards({ data }: Props) {
  const { tenants, users, revenue, calls, campaigns } = data;

  const usersSubtitle =
    users?.active !== undefined
      ? `${users.active.toLocaleString("en-IN")} active`
      : "Across all tenants";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Revenue"
        value={formatPaisa(revenue.totalPaisa)}
        subtitle={`${revenue.rechargeCount} recharges · ${formatPaisa(revenue.avgPerTenantPaisa)} avg`}
        icon={<TrendingUp size={18} />}
        iconColor="bg-brand-100 text-brand-600"
      />

      <StatsCard
        title="Total Tenants"
        value={tenants.total.toLocaleString("en-IN")}
        subtitle={`${tenants.active} active · ${tenants.newInPeriod} new`}
        icon={<Building2 size={18} />}
        iconColor="bg-info-100 text-info-600"
      />

      <StatsCard
        title="Total Users"
        value={(users?.total ?? 0).toLocaleString("en-IN")}
        subtitle={usersSubtitle}
        icon={<Users size={18} />}
        iconColor="bg-accent-100 text-accent-600"
      />

      <StatsCard
        title="Campaigns"
        value={campaigns.total.toLocaleString("en-IN")}
        subtitle={`${campaigns.active} active`}
        icon={<Target size={18} />}
        iconColor="bg-brand-100 text-brand-700"
      />

      <StatsCard
        title="Platform Calls"
        value={calls.total.toLocaleString("en-IN")}
        subtitle={`${calls.completed.toLocaleString("en-IN")} completed · ${calls.failed} failed`}
        icon={<PhoneCall size={18} />}
        iconColor="bg-secondary-50 text-secondary-600"
      />

      <StatsCard
        title="Audio Duration"
        value={`${Math.round(calls.totalDurationMinutes).toLocaleString("en-IN")} m`}
        subtitle="Total processing time"
        icon={<Clock size={18} />}
        iconColor="bg-warning-100 text-warning-600"
      />
    </div>
  );
}
