"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdminCallVolumeTrends } from "@/hooks/admin/useAdminDashboard";
import { formatDate } from "@/lib/utils/formatDate";
import type { AdminDateRange, AdminGranularity } from "@/types/admin-dashboard";
import { PhoneCall } from "lucide-react";
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
import {
  AXIS_TICK_STYLE,
  CHART_COLORS,
} from "@/components/dashboard/charts/chartTheme";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";

interface Props {
  filters: AdminDateRange;
}

const GRANULARITY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function AdminCallVolumeTrends({ filters }: Props) {
  const [granularity, setGranularity] = useState<AdminGranularity>("daily");

  const { data, isLoading } = useAdminCallVolumeTrends({
    ...filters,
    granularity,
  });

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
            <PhoneCall size={16} />
          </div>
          <CardTitle>Platform Call Volume</CardTitle>
        </div>
        <div className="w-32">
          <Select
            options={GRANULARITY_OPTIONS}
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as AdminGranularity)}
            aria-label="Granularity"
          />
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Spinner />
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No call data"
          description="Platform-wide call volume will appear here."
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
