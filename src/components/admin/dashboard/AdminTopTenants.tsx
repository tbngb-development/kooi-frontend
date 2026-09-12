"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdminTopTenants } from "@/hooks/admin/useAdminDashboard";
import { formatPaisa } from "@/lib/utils/formatMoney";
import type {
  AdminDateRange,
  AdminTopTenantsMetric,
} from "@/types/admin-dashboard";
import { Trophy } from "lucide-react";
import { useState } from "react";

interface Props {
  filters: AdminDateRange;
}

const METRIC_OPTIONS = [
  { value: "total_spend", label: "Total Spend" },
  { value: "call_volume", label: "Call Volume" },
  { value: "revenue", label: "Revenue" },
];

export function AdminTopTenants({ filters }: Props) {
  const [metric, setMetric] = useState<AdminTopTenantsMetric>("total_spend");

  const { data, isLoading } = useAdminTopTenants({
    ...filters,
    metric,
    limit: 10,
  });

  const formatValue = (v: number) =>
    metric === "call_volume" ? v.toLocaleString("en-IN") : formatPaisa(v);

  const rows = data?.data ?? [];
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
            <Trophy size={16} />
          </div>
          <CardTitle>Top Tenants</CardTitle>
        </div>
        <div className="w-40">
          <Select
            options={METRIC_OPTIONS}
            value={metric}
            onChange={(e) => setMetric(e.target.value as AdminTopTenantsMetric)}
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
          title="No tenant data"
          description="Tenant rankings will appear once activity begins."
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row, i) => {
            const pct = (row.value / max) * 100;
            return (
              <li key={row.tenantId} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base text-text-primary font-medium truncate">
                    <span className="text-text-muted mr-2">#{i + 1}</span>
                    {row.tenantName}
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
