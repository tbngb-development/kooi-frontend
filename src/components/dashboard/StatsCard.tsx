"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "bg-brand-50 text-brand-600 border-brand-100",
  trend,
}: StatsCardProps) {
  return (
    <Card
      padding="md"
      className="hover:shadow-md hover:-translate-y-0.5 hover:border-neutral-300 transition-all duration-normal ease-out"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          {/* Label */}
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            {title}
          </p>

          {/* Primary Metric */}
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary mt-1.5 leading-none font-mono">
            {value}
          </p>

          {/* Subtitle / Context */}
          {subtitle && (
            <p className="text-xs font-medium text-text-secondary mt-2.5 truncate">
              {subtitle}
            </p>
          )}

          {/* Trend Indicator */}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold mt-1.5",
                trend.positive ? "text-success-600" : "text-error-600",
              )}
            >
              {trend.positive ? (
                <TrendingUp size={12} strokeWidth={2.5} />
              ) : (
                <TrendingDown size={12} strokeWidth={2.5} />
              )}
              <span className="truncate">{trend.value}</span>
            </div>
          )}
        </div>

        {/* Icon Container */}
        <div
          className={cn(
            "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shrink-0 border shadow-xs",
            iconColor,
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
