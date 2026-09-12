"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardTopCampaigns } from "@/hooks/useDashboard";
import { formatPaisa } from "@/lib/utils/formatMoney";
import type { DashboardFilters, TopCampaignsMetric } from "@/types/dashboard";
import { Trophy } from "lucide-react";
import { useState } from "react";

interface Props {
  filters: DashboardFilters;
}

const METRIC_OPTIONS = [
  { value: "qualified_leads", label: "Qualified Leads" },
  { value: "total_calls", label: "Total Calls" },
  { value: "total_spend", label: "Total Spend" },
];

export function TopCampaigns({ filters }: Props) {
  const [metric, setMetric] = useState<TopCampaignsMetric>("qualified_leads");

  const { data, isLoading } = useDashboardTopCampaigns({
    ...filters,
    metric,
    limit: 5,
  });

  const formatValue = (v: number) =>
    metric === "total_spend" ? formatPaisa(v) : v.toLocaleString("en-IN");

  const rows = data?.data ?? [];
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
            <Trophy size={16} />
          </div>
          <CardTitle>Top Campaigns</CardTitle>
        </div>
        <div className="w-44">
          <Select
            options={METRIC_OPTIONS}
            value={metric}
            onChange={(e) => setMetric(e.target.value as TopCampaignsMetric)}
            aria-label="Ranking metric"
          />
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No campaigns to rank"
          description="Campaign performance will appear once activity begins."
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row, i) => {
            const pct = (row.value / max) * 100;
            return (
              <li key={row.id} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base text-text-primary font-medium truncate">
                    <span className="text-text-muted mr-2">#{i + 1}</span>
                    {row.name}
                  </span>
                  <span className="text-base font-semibold text-text-primary shrink-0">
                    {formatValue(row.value)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
