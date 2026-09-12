"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardDispositionBreakdown } from "@/hooks/useDashboard";
import type { DashboardFilters } from "@/types/dashboard";
import { PieChart as PieIcon } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_PALETTE } from "./charts/chartTheme";
import { ChartTooltip } from "./charts/ChartTooltip";
import { humanizeEnum } from "@/lib/utils/humanize";

interface Props {
  filters: DashboardFilters;
}

export function DispositionBreakdown({ filters }: Props) {
  const { data, isLoading } = useDashboardDispositionBreakdown(filters);

  const chartData = (data?.data ?? []).map((d) => ({
    name: humanizeEnum(d.disposition),
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <PieIcon size={16} />
          </div>
          <CardTitle>Call Outcomes</CardTitle>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Spinner />
        </div>
      ) : chartData.length === 0 ? (
        <EmptyState
          title="No call outcomes"
          description="Completed calls with dispositions will appear here."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip
                    formatValue={(v, name) => {
                      const item = chartData.find((c) => c.name === name);
                      return `${v.toLocaleString("en-IN")} (${item?.percentage.toFixed(1) ?? 0}%)`;
                    }}
                  />
                }
              />
              <Legend
                iconType="circle"
                iconSize={8}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
