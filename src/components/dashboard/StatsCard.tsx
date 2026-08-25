// src/components/dashboard/StatsCard.tsx

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

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
  iconColor = 'bg-brand-100 text-brand-600',
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-base text-text-muted font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-sm font-medium mt-1',
                trend.positive ? 'text-success-600' : 'text-error-600'
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
            iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}