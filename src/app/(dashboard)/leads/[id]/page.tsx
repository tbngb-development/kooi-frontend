// src/app/(dashboard)/leads/[id]/page.tsx

"use client";

import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useLead } from "@/hooks/useLeads";
import { formatDate, formatDateTime } from "@/lib/utils/formatDate";
import { formatDuration } from "@/lib/utils/formatDuration";
import { Building2, ChevronLeft, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LeadDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { data: lead, isLoading } = useLead(id);

  console.log("leads data from detail page: ", lead);

  if (isLoading) return <PageSpinner />;
  if (!lead)
    return <p className="text-text-muted text-base">Lead not found.</p>;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-base text-text-muted hover:text-text-primary mb-3 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Leads
        </Link>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">{lead.name}</h2>
          <LeadStatusBadge status={lead.status} />
        </div>
        <p className="text-base text-text-muted mt-1">
          Campaign:{" "}
          <Link
            href={`/campaigns/${lead.campaignId}`}
            className="text-brand-600 hover:underline"
          >
            {lead.campaign?.name ?? "Unknown"}
          </Link>
        </p>
      </div>

      {/* Contact Info */}
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <User size={15} className="text-text-muted shrink-0" />
            <div>
              <p className="text-sm text-text-muted">Full Name</p>
              <p className="text-base font-medium text-text-primary">
                {lead.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={15} className="text-text-muted shrink-0" />
            <div>
              <p className="text-sm text-text-muted">Phone</p>
              <p className="text-base font-medium text-text-primary font-mono">
                {lead.phone}
              </p>
            </div>
          </div>
          {lead.email && (
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-text-muted shrink-0" />
              <div>
                <p className="text-sm text-text-muted">Email</p>
                <p className="text-base font-medium text-text-primary">
                  {lead.email}
                </p>
              </div>
            </div>
          )}
          {lead.company && (
            <div className="flex items-center gap-2.5">
              <Building2 size={15} className="text-text-muted shrink-0" />
              <div>
                <p className="text-sm text-text-muted">Company</p>
                <p className="text-base font-medium text-text-primary">
                  {lead.company}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-surface-border">
          <p className="text-sm text-text-muted">
            Added {formatDate(lead.createdAt)}
          </p>
        </div>
      </Card>

      {/* Call History */}
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Call History
        </h3>
        {lead.calls && lead.calls.length > 0 ? (
          <div className="flex flex-col divide-y divide-surface-border">
            {lead.calls.map((call) => (
              <div key={call.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/calls/${call.id}`}
                    className="text-base font-medium text-brand-600 hover:underline"
                  >
                    View Call Details
                  </Link>
                  <span className="text-sm text-text-muted">
                    {formatDateTime(call.startedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                  <span>Status: {call.status}</span>
                  {call.duration && (
                    <span>Duration: {formatDuration(call.duration)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-text-muted">
            No calls made to this lead yet.
          </p>
        )}
      </Card>
    </div>
  );
}
