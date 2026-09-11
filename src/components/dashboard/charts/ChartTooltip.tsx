"use client";

import { CHART_COLORS } from "./chartTheme";

export interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[] | TooltipPayloadItem[];
  label?: string | number;
  formatValue?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-md px-3 py-2 shadow-lg text-xs"
      style={{
        background: CHART_COLORS.tooltipBg,
        color: CHART_COLORS.tooltipText,
      }}
    >
      {label !== undefined && label !== null && (
        <p className="font-semibold mb-1.5 text-white">
          {labelFormatter ? labelFormatter(String(label)) : String(label)}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => {
          const name = entry.name ?? "";
          const rawValue =
            typeof entry.value === "number"
              ? entry.value
              : Number(entry.value ?? 0);

          const formattedValue = formatValue
            ? formatValue(rawValue, name)
            : rawValue.toLocaleString("en-IN");

          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: entry.color ?? CHART_COLORS.neutral }}
              />
              <span className="text-white/70">{name}</span>
              <span className="ml-auto font-semibold pl-3 text-white">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
