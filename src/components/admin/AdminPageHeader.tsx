"use client";

import Link from "next/link";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { ArrowLeft } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  onRefresh,
  isRefreshing,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <Link
          href={backHref}
          className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-text-muted mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onRefresh && (
          <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
        )}
      </div>
    </div>
  );
}
