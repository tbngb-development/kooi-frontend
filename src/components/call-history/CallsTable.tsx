"use client";

import Link from "next/link";
import { Phone, Clock, Coins, Calendar, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { CallStatusBadge } from "./CallStatusBadge";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { formatDuration } from "@/lib/utils/formatDuration";
import { paisaToInr } from "@/constants/config/wallet.config";
import type { Call, Disposition, LeadTemperature } from "@/types/call";
import type { Pagination as PaginationMeta } from "@/types/api";

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

// Directly utilizes your precise custom CSS theme variables
const temperatureStyle: Record<LeadTemperature, string> = {
  HOT: "bg-hot-bg text-hot-text border-hot-border",
  WARM: "bg-warm-bg text-warm-text border-warm-border",
  NURTURE: "bg-info-50 text-info-700 border-info-200",
  COLD: "bg-cold-bg text-cold-text border-cold-border",
  NOT_APPLICABLE:
    "bg-neutral-temp-bg text-neutral-temp-text border-neutral-temp-border",
};

function TemperatureBadge({ value }: { value: LeadTemperature }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold border ${temperatureStyle[value]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
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
        icon={
          <Phone size={24} className="text-text-muted animate-pulse-soft" />
        }
        title="No calls recorded yet"
        description="Launch campaigns and activate agents to monitor live outgoing qualifications here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 📱 MOBILE CARD VIEW (Active up to 768px / 'md' breakpoint) */}
      <div className="block md:hidden space-y-4">
        {calls.map((call) => {
          const analysis = call.callAnalysis ?? null;
          const attemptCount = (call.callHistory?.length ?? 0) + 1;
          const leadName = call.lead?.name ?? "Unknown Lead";
          const leadPhone = call.lead?.phone ?? "—";

          return (
            <div
              key={call.id}
              className="bg-surface rounded-xl border border-surface-border p-4 shadow-sm flex flex-col gap-3.5 card-interactive overflow-hidden"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col min-w-0">
                  <Link
                    href={`/campaigns/${call.campaignId}/calls/${call.id}`}
                    className="font-semibold text-text-primary hover:text-brand-600 transition-colors duration-normal ease-out flex items-center gap-1 group"
                  >
                    <span className="text-base truncate">{leadName}</span>
                    <ChevronRight
                      size={16}
                      className="text-text-placeholder group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5 shrink-0"
                    />
                  </Link>
                  <span className="text-sm font-mono text-text-secondary mt-0.5 truncate">
                    {leadPhone}
                  </span>
                </div>
                <CallStatusBadge status={call.status} />
              </div>

              <div className="h-px bg-surface-subtle w-full" />

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-text-secondary">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Campaign
                  </span>
                  <Link
                    href={`/campaigns/${call.campaignId}`}
                    className="hover:text-brand-600 transition-colors text-base truncate font-medium"
                  >
                    {call.campaign?.name ?? "—"}
                  </Link>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Cost
                  </span>
                  <span className="text-base font-semibold text-text-primary flex items-center gap-1">
                    <Coins size={13} className="text-text-placeholder" />
                    {call?.platformCost != null
                      ? paisaToInr(call.platformCost)
                      : "₹0.00"}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Duration
                  </span>
                  <span className="text-base font-medium text-text-secondary flex items-center gap-1">
                    <Clock size={13} className="text-text-placeholder" />
                    {formatDuration(call.duration)}
                  </span>
                </div>

                {showAttempts && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                      Attempt
                    </span>
                    <span className="text-base font-semibold text-brand-700">
                      #{attemptCount}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Evaluation
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {analysis?.disposition ? (
                      <span className="inline-flex items-center rounded-md bg-surface-subtle px-2.5 py-0.5 text-sm font-medium text-text-primary border border-surface-border">
                        {dispositionLabel[analysis.disposition]}
                      </span>
                    ) : (
                      <span className="text-sm text-text-placeholder">—</span>
                    )}
                    {analysis?.leadTemperature && (
                      <TemperatureBadge value={analysis.leadTemperature} />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-subtle -mx-4 -mb-4 px-4 py-2.5 border-t border-surface-border flex justify-between items-center text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {call.startedAt ? formatDateOnly(call.startedAt) : "—"}
                </span>
                <span className="flex items-center gap-1 font-medium text-text-secondary">
                  <Clock size={13} />
                  {call.startedAt ? formatTimeOnly(call.startedAt) : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🖥️ DESKTOP VIEW (Active on sizes md:768px and wider) */}
      <div className="hidden md:block bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle">
                <th className="px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  Phone
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  Campaign
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                {showAttempts && (
                  <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-center whitespace-nowrap">
                    Attempt
                  </th>
                )}
                <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  Disposition
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  Temperature
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                  Cost
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                  Duration
                </th>
                <th className="px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  Date / Time
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
                    className="hover:bg-surface-hover/60 transition-colors duration-normal ease-out"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/campaigns/${call.campaignId}/calls/${call.id}`}
                        className="font-semibold text-text-primary hover:text-brand-600 transition-colors text-base block truncate max-w-[180px]"
                      >
                        {call.lead?.name ?? "Unknown"}
                      </Link>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-base font-mono font-medium text-text-secondary">
                        {call.lead?.phone ?? "—"}
                      </span>
                    </td>

                    {/* Campaign */}
                    <td className="px-4 py-4">
                      <Link
                        href={`/campaigns/${call.campaignId}`}
                        className="text-text-secondary hover:text-brand-600 text-base font-medium transition-colors block truncate max-w-[180px]"
                      >
                        {call.campaign?.name ?? "—"}
                      </Link>
                    </td>

                    {/* Call Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <CallStatusBadge status={call.status} />
                    </td>

                    {/* Attempts count */}
                    {showAttempts && (
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center rounded-full bg-surface-subtle border border-surface-border px-2.5 py-0.5 text-sm font-semibold text-text-secondary">
                          #{attemptCount}
                        </span>
                      </td>
                    )}

                    {/* Disposition */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {analysis?.disposition ? (
                        <span className="inline-flex items-center rounded bg-surface-subtle px-2 py-0.5 text-sm font-medium text-text-secondary border border-surface-border">
                          {dispositionLabel[analysis.disposition]}
                        </span>
                      ) : (
                        <span className="text-text-placeholder text-sm">—</span>
                      )}
                    </td>

                    {/* Temperature */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {analysis?.leadTemperature ? (
                        <TemperatureBadge value={analysis.leadTemperature} />
                      ) : (
                        <span className="text-text-placeholder text-sm">—</span>
                      )}
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="text-base font-semibold text-text-primary inline-flex items-center gap-1 justify-end">
                        {call?.platformCost != null
                          ? paisaToInr(call.platformCost)
                          : "₹0.00"}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <span className="text-base font-medium text-text-secondary inline-flex items-center gap-1 justify-end">
                        {formatDuration(call.duration)}
                      </span>
                    </td>

                    {/* Timestamp split layout */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {call.startedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base font-medium text-text-primary leading-tight">
                            {formatTimeOnly(call.startedAt)}
                          </span>
                          <span className="text-sm text-text-muted font-medium leading-tight">
                            {formatDateOnly(call.startedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-placeholder text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧭 SYSTEM PAGINATION */}
      {pagination && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 px-1">
          <p className="text-sm text-text-muted font-medium text-center sm:text-left order-2 sm:order-1">
            Showing{" "}
            <strong className="text-text-secondary font-semibold">
              {calls.length}
            </strong>{" "}
            of{" "}
            <strong className="text-text-secondary font-semibold">
              {pagination.total}
            </strong>{" "}
            qualified calls
          </p>
          <div className="order-1 sm:order-2">
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
