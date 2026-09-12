"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardTemperatureDistribution } from "@/hooks/useDashboard";
import type { DashboardFilters, LeadTemperature } from "@/types/dashboard";
import { Thermometer } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK_STYLE, CHART_COLORS } from "./charts/chartTheme";
import { ChartTooltip } from "./charts/ChartTooltip";

interface Props {
  filters: DashboardFilters;
}

const TEMP_ORDER: LeadTemperature[] = ["HOT", "WARM", "NURTURE", "COLD"];

const TEMP_COLOR: Record<LeadTemperature, string> = {
  HOT: CHART_COLORS.hot,
  WARM: CHART_COLORS.warm,
  NURTURE: CHART_COLORS.nurture,
  COLD: CHART_COLORS.cold,
};

export function TemperatureDistribution({ filters }: Props) {
  const { data, isLoading } = useDashboardTemperatureDistribution(filters);

  const chartData = TEMP_ORDER.map((temp) => {
    const found = data?.data.find((d) => d.temperature === temp);
    return {
      temperature: temp,
      count: found?.count ?? 0,
      percentage: found?.percentage ?? 0,
    };
  });

  const hasData = chartData.some((d) => d.count > 0);

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-50 text-error-600">
            <Thermometer size={16} />
          </div>
          <CardTitle>Lead Temperature</CardTitle>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Spinner />
        </div>
      ) : !hasData ? (
        <EmptyState
          title="No temperature data"
          description="Analyzed leads will be classified by temperature."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                stroke={CHART_COLORS.grid}
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={AXIS_TICK_STYLE}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="temperature"
                tick={AXIS_TICK_STYLE}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                width={80}
              />
              <Tooltip
                cursor={{ fill: "var(--color-surface-hover)" }}
                content={
                  <ChartTooltip
                    formatValue={(v, name) => {
                      const item = chartData.find(
                        (c) =>
                          c.temperature === name || String(v) === String(v),
                      );
                      return `${v.toLocaleString("en-IN")} (${item?.percentage.toFixed(1) ?? 0}%)`;
                    }}
                  />
                }
              />
              <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.temperature} fill={TEMP_COLOR[d.temperature]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
