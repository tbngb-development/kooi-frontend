"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardLeadFunnel } from "@/hooks/useDashboard";
import type { DashboardFilters } from "@/types/dashboard";
import { Filter } from "lucide-react";

interface Props {
  filters: DashboardFilters;
}

interface Stage {
  label: string;
  value: number;
  rate?: number; // % of previous stage
  color: string;
}

export function LeadFunnel({ filters }: Props) {
  const { data, isLoading } = useDashboardLeadFunnel(filters);

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <Filter size={16} />
          </div>
          <CardTitle>Lead Funnel</CardTitle>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Spinner />
        </div>
      ) : !data || data.totalLeads === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Upload leads to a campaign to see the funnel."
        />
      ) : (
        <FunnelBody data={data} />
      )}
    </Card>
  );
}

function FunnelBody({
  data,
}: {
  data: NonNullable<ReturnType<typeof useDashboardLeadFunnel>["data"]>;
}) {
  const stages: Stage[] = [
    {
      label: "Total Leads",
      value: data.totalLeads,
      color: "bg-chart-3",
    },
    {
      label: "Called",
      value: data.calledLeads,
      rate: data.rates.callRate,
      color: "bg-chart-2",
    },
    {
      label: "Completed",
      value: data.completedLeads,
      rate: data.rates.completionRate,
      color: "bg-chart-1",
    },
    {
      label: "Qualified",
      value: data.qualifiedLeads,
      rate: data.rates.qualificationRate,
      color: "bg-success-500",
    },
  ];

  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {stages.map((stage) => {
        const widthPct = (stage.value / max) * 100;
        return (
          <div key={stage.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-medium text-text-secondary">
                {stage.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-text-primary">
                  {stage.value.toLocaleString("en-IN")}
                </span>
                {stage.rate !== undefined && (
                  <span className="text-xs text-text-muted">
                    {stage.rate.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-md bg-surface-subtle">
              <div
                className="h-full rounded-md transition-all duration-500"
                style={{
                  width: `${Math.max(4, widthPct)}%`,
                  background: getStageColor(stage.label),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStageColor(label: string): string {
  switch (label) {
    case "Total Leads":
      return "var(--color-chart-3)";
    case "Called":
      return "var(--color-chart-2)";
    case "Completed":
      return "var(--color-chart-1)";
    case "Qualified":
      return "var(--color-success-500)";
    default:
      return "var(--color-chart-neutral)";
  }
}
