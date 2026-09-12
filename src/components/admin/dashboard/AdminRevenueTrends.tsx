"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdminRevenueTrends } from "@/hooks/admin/useAdminDashboard";
import { formatPaisa, paisaToRupees } from "@/lib/utils/formatMoney";
import { formatDate } from "@/lib/utils/formatDate";
import type { AdminDateRange, AdminGranularity } from "@/types/admin-dashboard";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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

export function AdminRevenueTrends({ filters }: Props) {
  const [granularity, setGranularity] = useState<AdminGranularity>("daily");

  const { data, isLoading } = useAdminRevenueTrends({
    ...filters,
    granularity,
  });

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <TrendingUp size={16} />
          </div>
          <CardTitle>Revenue Over Time</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32">
            <Select
              options={GRANULARITY_OPTIONS}
              value={granularity}
              onChange={(e) =>
                setGranularity(e.target.value as AdminGranularity)
              }
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
          title="No revenue data"
          description="Revenue trends will appear once tenants recharge."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data.data}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
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
                yAxisId="revenue"
                tick={AXIS_TICK_STYLE}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickFormatter={(v: number) => `₹${paisaToRupees(v).toFixed(0)}`}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                tick={AXIS_TICK_STYLE}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                allowDecimals={false}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    labelFormatter={(l) => formatDate(l, "MMM d, yyyy")}
                    formatValue={(v, name) =>
                      name === "Recharges" ? String(v) : formatPaisa(v)
                    }
                  />
                }
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar
                yAxisId="count"
                dataKey="rechargeCount"
                fill={CHART_COLORS.bonus}
                name="Recharges"
                opacity={0.4}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="totalRevenuePaisa"
                stroke={CHART_COLORS.cash}
                strokeWidth={2}
                dot={false}
                name="Revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
