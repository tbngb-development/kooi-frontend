/**
 * Recharts theme tokens sourced from the design system CSS variables.
 * These are read at runtime so dark-mode / theming just works.
 */
export const CHART_PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
  "var(--color-chart-9)",
  "var(--color-chart-10)",
] as const;

export const CHART_COLORS = {
  grid: "var(--color-chart-grid)",
  axis: "var(--color-chart-axis)",
  label: "var(--color-chart-label)",
  positive: "var(--color-chart-positive)",
  negative: "var(--color-chart-negative)",
  neutral: "var(--color-chart-neutral)",
  tooltipBg: "var(--color-chart-tooltip-bg)",
  tooltipText: "var(--color-chart-tooltip-text)",
  cash: "var(--color-chart-1)",
  bonus: "var(--color-chart-3)",
  completed: "var(--color-chart-1)",
  failed: "var(--color-chart-7)",
  noAnswer: "var(--color-chart-6)",
  hot: "var(--color-hot)",
  warm: "var(--color-warm)",
  cold: "var(--color-cold)",
  nurture: "var(--color-chart-3)",
} as const;

export const AXIS_TICK_STYLE = {
  fill: "var(--color-chart-label)",
  fontSize: 12,
} as const;
