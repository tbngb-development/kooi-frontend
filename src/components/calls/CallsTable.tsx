"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { CallStatusBadge } from "./CallStatusBadge";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { formatDuration } from "@/lib/utils/formatDuration";
import type {
  Call,
  Disposition,
  LeadTemperature,
  PaginationMeta,
} from "@/types";
import { Phone } from "lucide-react";
import Link from "next/link";

const dispositionLabel: Record<Disposition, string> = {
  INTERESTED_SEND_DETAILS: "Send Details",
  QUALIFIED_CONSULTANT_FOLLOWUP: "Consultant F/U",
  SITE_VISIT_INTEREST: "Site Visit",
  INTERESTED_GENERAL: "Interested",
  FOLLOWUP_REQUESTED: "Follow-up",
  NOT_INTERESTED: "Not Interested",
  DO_NOT_CALL: "Do Not Call",
  WRONG_NUMBER: "Wrong Number",
  ALREADY_PURCHASED: "Already Bought",
  BROKER: "Broker",
  LANGUAGE_CALLBACK_REQUIRED: "Language CB",
  CALL_ENDED_BY_CUSTOMER: "Ended by Lead",
  CALL_ENDED_ABUSIVE: "Abusive",
  NO_RESPONSE: "No Response",
  CALL_DROPPED: "Dropped",
};



const temperatureStyle: Record<LeadTemperature, string> = {
  HOT: "bg-error-100 text-error-700",
  WARM: "bg-warning-100 text-warning-700",
  NURTURE: "bg-info-100 text-info-700",
  COLD: "bg-surface-subtle text-text-muted",
  NOT_APPLICABLE: "bg-surface-subtle text-text-muted",
};

function TemperatureBadge({ value }: { value: LeadTemperature }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium ${temperatureStyle[value]}`}
    >
      {value}
    </span>
  );
}

interface CallsTableProps {
  calls: Call[];
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  showAttempts?: boolean;
}

export function CallsTable({
  calls,
  pagination,
  onPageChange,
  showAttempts = false,
}: CallsTableProps) {
  if (calls.length === 0) {
    return (
      <EmptyState
        icon={<Phone size={22} />}
        title="No calls yet"
        description="Start a campaign to see calls here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface rounded-lg border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle">
                <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Lead
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Campaign
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Status
                </th>
                {showAttempts && (
                  <th className="text-center px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Attempts
                  </th>
                )}
                <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Disposition
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Temperature
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Cost
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Duration
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {calls.map((call) => {
                const analysis = call.callAnalysis ?? null;
                const attemptCount = (call.callHistory?.length ?? 0) + 1;

                return (
                  <tr
                    key={call.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/campaigns/${call.campaignId}/calls/${call.id}`}
                        className="font-medium text-text-primary hover:text-brand-600 transition-colors"
                      >
                        {call.lead?.name ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-sm">
                      <Link
                        href={`/campaigns/${call.campaignId}/calls/${call.id}`}
                        className="font-medium text-text-primary hover:text-brand-600 transition-colors"
                      >
                        {call.lead?.phone ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/campaigns/${call.campaignId}`}
                        className="text-text-muted hover:text-brand-600 text-sm transition-colors"
                      >
                        {call.campaign?.name ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <CallStatusBadge status={call.status} />
                    </td>
                    {showAttempts && (
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-semibold text-text-secondary">
                          #{attemptCount}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {analysis?.disposition
                        ? dispositionLabel[analysis.disposition]
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {analysis?.leadTemperature ? (
                        <TemperatureBadge value={analysis.leadTemperature} />
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {call?.cost != null
                        ? `$${(call.cost / 100).toFixed(2)}`
                        : "$0.00"}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-5 py-3">
                      {call.startedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base font-medium text-text-primary leading-none">
                            {formatTimeOnly(call.startedAt)}
                          </span>
                          <span className="text-sm text-text-muted leading-none">
                            {formatDateOnly(call.startedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing {calls.length} of {pagination.total} calls
          </p>
          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
