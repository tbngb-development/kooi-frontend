"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useBatches } from "@/hooks/useBatches";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import type { LeadBatch } from "@/types/batch";
import {
  CheckCircle,
  FileSpreadsheet,
  Phone,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { BatchActions } from "./BatchActions";
import { BatchStatusBadge } from "./BatchStatusBadge";

interface BatchListProps {
  campaignId: string;
}

export function BatchList({ campaignId }: BatchListProps) {
  const { data: batches, isLoading, error } = useBatches(campaignId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error-100 bg-error-50 p-4 text-sm text-error-700">
        Failed to load batches
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <EmptyState
        icon={<FileSpreadsheet size={24} />}
        title="No batches yet"
        description="Upload a CSV / XLS / XLSX file to create your first batch of leads."
      />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-surface-border bg-surface">
      <div className="overflow-x-auto thin-scrollbar">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-surface-subtle border-b border-surface-border">
            <tr>
              <Th align="left">File</Th>
              <Th align="left">Status</Th>
              <Th align="center">Leads</Th>
              <Th align="center">Called</Th>
              <Th align="center">Completed</Th>
              <Th align="center">Failed</Th>
              <Th align="left">Runs At</Th>
              <Th align="center">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {batches.map((batch) => (
              <BatchRow key={batch.id} batch={batch} campaignId={campaignId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align: "left" | "center";
}) {
  return (
    <th
      className={`px-4 py-3 text-${align} text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap`}
    >
      {children}
    </th>
  );
}

function BatchRow({
  batch,
  campaignId,
}: {
  batch: LeadBatch;
  campaignId: string;
}) {
  return (
    <tr className="hover:bg-surface-hover transition-colors">
      {/* File */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={14} className="text-text-muted shrink-0" />
          <span className="max-w-[200px] truncate font-medium text-text-primary">
            {batch.fileName ?? "Unknown"}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <BatchStatusBadge status={batch.status} />
      </td>

      {/* Metrics */}
      <MetricCell
        icon={<Users size={12} className="text-text-muted" />}
        value={batch.totalLeads}
        color="text-text-secondary"
      />
      <MetricCell
        icon={<Phone size={12} />}
        value={batch.calledLeads}
        color="text-info-600"
      />
      <MetricCell
        icon={<CheckCircle size={12} />}
        value={batch.completedLeads}
        color="text-success-600"
      />
      <MetricCell
        icon={<XCircle size={12} />}
        value={batch.failedLeads}
        color="text-error-500"
      />

      {/* Runs At — Instant badge OR scheduled datetime */}
      <td className="px-4 py-3 whitespace-nowrap">
        <RunsAtCell batch={batch} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        <BatchActions
          campaignId={campaignId}
          batchId={batch.id}
          status={batch.status}
        />
      </td>
    </tr>
  );
}

function MetricCell({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  color: string;
}) {
  return (
    <td className="px-4 py-3 text-center whitespace-nowrap">
      <span
        className={`inline-flex items-center justify-center gap-1 ${color}`}
      >
        {icon}
        {value}
      </span>
    </td>
  );
}

/**
 * "Runs At" column:
 * - SCHEDULED  → scheduled date/time
 * - startedAt  → actual start date/time
 * - Otherwise  → "Instant" pill (was queued for immediate run)
 */
function RunsAtCell({ batch }: { batch: LeadBatch }) {
  const runAt = batch.scheduledAt ?? batch.startedAt;
  console.log('run at: ', runAt)

  if (!runAt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase tracking-wide">
        <Zap size={10} />
        Instant
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-text-primary leading-none">
        {formatTimeOnly(runAt)}
      </span>
      <span className="text-xs text-text-muted leading-none">
        {formatDateOnly(runAt)}
      </span>
    </div>
  );
}
