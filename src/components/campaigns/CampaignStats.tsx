import { Card } from "@/components/ui/Card";
import type { Campaign, CampaignPerformance } from "@/types";
import {
  Flame,
  PhoneCall,
  MapPin,
  PhoneOff,
  DollarSign,
  TrendingUp,
  Percent,
  XCircle,
} from "lucide-react";

interface CampaignStatsProps {
  campaign: Campaign;
  performance: CampaignPerformance | null;
  isLoadingPerformance?: boolean;
}

export function CampaignStats({
  campaign,
  performance,
  isLoadingPerformance,
}: CampaignStatsProps) {
  const completionPct =
    campaign.totalLeads > 0
      ? Math.round((campaign.calledLeads / campaign.totalLeads) * 100)
      : 0;

  const successRate =
    campaign.calledLeads > 0
      ? Math.round((campaign.successLeads / campaign.calledLeads) * 100)
      : 0;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-primary mb-5">
        Performance Overview
      </h3>

      {/* ─── Stats Grid (Card Form) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Flame size={16} />}
          label="Hot Leads"
          value={performance?.hotLeads ?? "—"}
          color="text-amber-600"
          iconBg="bg-amber-50"
          loading={isLoadingPerformance}
        />
        <StatCard
          icon={<MapPin size={16} />}
          label="Site Visits"
          value={performance?.siteVisits ?? "—"}
          color="text-cyan-600"
          iconBg="bg-cyan-50"
          loading={isLoadingPerformance}
        />
        <StatCard
          icon={<PhoneCall size={16} />}
          label="Callbacks"
          value={performance?.callbacks ?? "—"}
          color="text-blue-600"
          iconBg="bg-blue-50"
          loading={isLoadingPerformance}
        />

        <StatCard
          icon={<Percent size={16} />}
          label="Qualification Rate"
          value={
            performance?.qualificationRate
              ? `${performance.qualificationRate}%`
              : "—"
          }
          color="text-success-600"
          iconBg="bg-success-50"
          loading={isLoadingPerformance}
        />
        <StatCard
          icon={<DollarSign size={16} />}
          label="Total Cost"
          value={
            performance
              ? `$${performance.totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "—"
          }
          color="text-emerald-600"
          iconBg="bg-emerald-50"
          loading={isLoadingPerformance}
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Cost Per Lead"
          value={performance ? `$${performance.costPerLead.toFixed(2)}` : "—"}
          color="text-violet-600"
          iconBg="bg-violet-50"
          loading={isLoadingPerformance}
        />
        <StatCard
          icon={<PhoneOff size={16} />}
          label="DNC Registered"
          value={performance?.dnc ?? "—"}
          color="text-red-600"
          iconBg="bg-red-50"
          loading={isLoadingPerformance}
        />
        <StatCard
          icon={<XCircle size={16} />}
          label="Failed Calls"
          value={campaign.failedLeads}
          color="text-error-600"
          iconBg="bg-error-50"
        />
      </div>

      {/* ─── Progress Bars ─── */}
      <div className="flex flex-col gap-3 pt-2">
        <div>
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span className="font-medium">Campaign Progress</span>
            <span>{completionPct}% complete</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span className="font-medium">
              Success Rate (HOT/WARM of called leads)
            </span>
            <span className="text-success-600 font-medium">{successRate}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-success-500 transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Stat Card Component ───

function StatCard({
  icon,
  label,
  value,
  color,
  iconBg,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  iconBg: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-300 shadow-sm p-4 flex flex-col gap-3 hover:border-brand-200 transition-colors">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${iconBg} ${color}`}
        >
          {icon}
        </div>
        <p className="text-xs font-medium text-text-muted line-clamp-1">
          {label}
        </p>
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-16 rounded bg-surface-subtle animate-pulse" />
        ) : (
          <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
        )}
      </div>
    </div>
  );
}
