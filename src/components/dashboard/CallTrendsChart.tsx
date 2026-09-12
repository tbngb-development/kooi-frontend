"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardCallTrends } from "@/hooks/useDashboard";
import type { DashboardFilters, Granularity } from "@/types/dashboard";
import { Phone } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK_STYLE, CHART_COLORS } from "./charts/chartTheme";
import { ChartTooltip } from "./charts/ChartTooltip";
import { formatDate } from "@/lib/utils/formatDate";

interface Props {
  filters: DashboardFilters;
}

const GRANULARITY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function CallTrendsChart({ filters }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("daily");

  const { data, isLoading } = useDashboardCallTrends({
    ...filters,
    granularity,
  });

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Phone size={16} />
          </div>
          <CardTitle>Call Volume</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32">
            <Select
              options={GRANULARITY_OPTIONS}
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as Granularity)}
              aria-label="Granularity"
            />
          </div>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Spinner />
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No call data"
          description="No calls have been placed in the selected period."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.data}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke={CHART_COLORS.grid}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={AXIS_TICK_STYLE}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickFormatter={(v: string) => formatDate(v, "MMM d")}
              />
              <YAxis
                tick={AXIS_TICK_STYLE}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--color-surface-hover)" }}
                content={
                  <ChartTooltip
                    labelFormatter={(l) => formatDate(l, "MMM d, yyyy")}
                  />
                }
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar
                dataKey="completed"
                stackId="a"
                fill={CHART_COLORS.completed}
                name="Completed"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="noAnswer"
                stackId="a"
                fill={CHART_COLORS.noAnswer}
                name="No Answer"
              />
              <Bar
                dataKey="failed"
                stackId="a"
                fill={CHART_COLORS.failed}
                name="Failed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
