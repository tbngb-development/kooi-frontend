"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardSpendTrends } from "@/hooks/useDashboard";
import { formatPaisa, paisaToRupees } from "@/lib/utils/formatMoney";
import type { DashboardFilters, Granularity } from "@/types/dashboard";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
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

export function SpendTrendsChart({ filters }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("daily");

  const { data, isLoading } = useDashboardSpendTrends({
    ...filters,
    granularity,
  });

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
            <TrendingUp size={16} />
          </div>
          <CardTitle>Spend Over Time</CardTitle>
        </div>
        <div className="w-32">
          <Select
            options={GRANULARITY_OPTIONS}
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
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
          title="No spend data"
          description="Nothing has been spent in the selected period."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.data}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={CHART_COLORS.cash}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_COLORS.cash}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="bonusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={CHART_COLORS.bonus}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_COLORS.bonus}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
                tickFormatter={(v: number) => `₹${paisaToRupees(v).toFixed(0)}`}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    labelFormatter={(l) => formatDate(l, "MMM d, yyyy")}
                    formatValue={(v) => formatPaisa(v)}
                  />
                }
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="cashSpentPaisa"
                stackId="1"
                stroke={CHART_COLORS.cash}
                fill="url(#cashGrad)"
                name="Cash"
              />
              <Area
                type="monotone"
                dataKey="bonusSpentPaisa"
                stackId="1"
                stroke={CHART_COLORS.bonus}
                fill="url(#bonusGrad)"
                name="Bonus"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
