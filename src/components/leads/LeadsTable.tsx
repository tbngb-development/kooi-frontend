"use client";

import Link from "next/link";
import {
  Users,
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import type { Pagination as PaginationMeta } from "@/types/api";
import type { Lead } from "@/types/lead";

interface LeadsTableProps {
  leads: Lead[];
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function LeadsTable({
  leads,
  pagination,
  onPageChange,
}: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={
          <Users size={24} className="text-text-muted animate-pulse-soft" />
        }
        title="No leads found"
        description="Upload a CSV file or add leads manually to start running campaigns."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 📱 MOBILE CARD VIEW (Active up to 768px / 'md' breakpoint) */}
      <div className="block md:hidden space-y-4">
        {leads.map((lead) => {
          const leadName = lead?.name ?? "Unknown Lead";
          const leadEmail = lead?.email ?? "";
          const leadPhone = lead?.phone ?? "—";

          return (
            <div
              key={lead.id}
              className="bg-surface rounded-xl border border-surface-border p-4 shadow-sm flex flex-col gap-3.5 card-interactive"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-semibold text-text-primary hover:text-brand-600 transition-colors duration-normal ease-out flex items-center gap-1 group"
                  >
                    <span className="text-base">{leadName}</span>
                    <ChevronRight
                      size={16}
                      className="text-text-placeholder group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                  {leadEmail && (
                    <span className="text-sm text-text-muted mt-0.5 flex items-center gap-1 break-all">
                      <Mail size={12} className="shrink-0" />
                      {leadEmail}
                    </span>
                  )}
                </div>
                <LeadStatusBadge status={lead.status} />
              </div>

              <div className="h-px bg-surface-subtle w-full" />

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-text-secondary">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Phone
                  </span>
                  <span className="text-base font-mono font-medium text-text-primary">
                    {leadPhone}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Campaign
                  </span>
                  <Link
                    href={`/campaigns/${lead.campaignId}`}
                    className="hover:text-brand-600 transition-colors text-base truncate font-medium"
                  >
                    {lead.campaign?.name ?? "—"}
                  </Link>
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                    Contact Status (DND)
                  </span>
                  <div className="mt-0.5">
                    {lead.doNotCall ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-semibold text-error-700 border border-error-100">
                        <ShieldAlert size={12} />
                        DND Restricted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-700 border border-success-100">
                        <CheckCircle2 size={12} />
                        Contactable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-subtle -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl border-t border-surface-border flex justify-between items-center text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Created:{" "}
                  {lead.createdAt ? formatDateOnly(lead.createdAt) : "—"}
                </span>
                <span className="flex items-center gap-1 font-medium text-text-secondary">
                  <Clock size={13} />
                  {lead.createdAt ? formatTimeOnly(lead.createdAt) : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🖥️ DESKTOP VIEW (Active on sizes md:768px and wider) */}
      <div className="hidden md:block bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle">
                <th className="px-6 py-4.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Lead Information
                </th>
                <th className="px-5 py-4.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-4.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-4.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Campaign Target
                </th>
                <th className="px-5 py-4.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  DND Status
                </th>
                <th className="px-6 py-4.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Date / Time Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-surface-hover/60 transition-colors duration-normal ease-out"
                >
                  {/* Lead Info (Name & Email) */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-[220px]">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-semibold text-text-primary hover:text-brand-600 transition-colors text-base truncate"
                      >
                        {lead?.name ?? "Unknown"}
                      </Link>
                      {lead.email ? (
                        <span className="text-sm text-text-muted mt-0.5 truncate flex items-center gap-1">
                          <Mail
                            size={12}
                            className="shrink-0 text-text-placeholder"
                          />
                          {lead.email}
                        </span>
                      ) : (
                        <span className="text-sm text-text-placeholder mt-0.5">
                          —
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Phone (Monospace formatting for visual precision) */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-base font-mono font-semibold text-text-secondary">
                      {lead.phone}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <LeadStatusBadge status={lead.status} />
                  </td>

                  {/* Campaign details */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/campaigns/${lead.campaignId}`}
                      className="text-text-secondary hover:text-brand-600 text-base font-medium transition-colors line-clamp-1"
                    >
                      {lead.campaign?.name ?? "—"}
                    </Link>
                  </td>

                  {/* Accessible DND status indicators */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {lead.doNotCall ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-semibold text-error-700 border border-error-100">
                        <ShieldAlert size={12} />
                        DND
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-700 border border-success-100">
                        <CheckCircle2 size={12} />
                        Allowed
                      </span>
                    )}
                  </td>

                  {/* Timestamp split view */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.createdAt ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-medium text-text-primary">
                          {formatTimeOnly(lead.createdAt)}
                        </span>
                        <span className="text-sm text-text-muted font-medium">
                          {formatDateOnly(lead.createdAt)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-placeholder text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
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
              {leads.length}
            </strong>{" "}
            of{" "}
            <strong className="text-text-secondary font-semibold">
              {pagination.total}
            </strong>{" "}
            registered leads
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
