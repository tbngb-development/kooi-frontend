// src/app/(dashboard)/campaigns/[id]/leads/[leadId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useLead } from "@/hooks/useLeads";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import {
  ChevronLeft,
  Phone,
  Building2,
  Mail,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils/formatDate";

export default function CampaignLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = String(params.id);
  const leadId = String(params.leadId);

  const { data: lead, isLoading } = useLead(leadId);

  if (isLoading) return <PageSpinner />;
  if (!lead) return <p className="text-text-muted text-base">Lead not found.</p>;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(`/campaigns/${campaignId}/leads`);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-base text-text-muted hover:text-text-primary mb-3 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          Back to Leads
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-text-primary">
            {lead.name || "Unknown Name"}
          </h2>
          <LeadStatusBadge status={lead.status} />
          {lead.doNotCall && (
            <span className="inline-flex items-center gap-1 rounded-full bg-error-100 px-2.5 py-1 text-base font-medium text-error-700 border border-error-200">
              <AlertCircle size={10} />
              Do Not Call
            </span>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Contact Information
          </h3>
          <div className="flex flex-col gap-3 text-base">
            <div className="flex items-center gap-3 text-text-secondary">
              <Phone size={16} className="text-text-muted" />
              <span className="font-mono">{lead.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Mail size={16} className="text-text-muted" />
              <span>{lead.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Building2 size={16} className="text-text-muted" />
              <span>{lead.company || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <Calendar size={16} className="text-text-muted" />
              <span>Imported {formatDate(lead.createdAt)}</span>
            </div>
          </div>
        </Card>

        {/* Metadata display (e.g. from CSV import) */}
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Import Metadata
          </h3>
          {lead.metadata && Object.keys(lead.metadata).length > 0 ? (
            <div className="bg-surface-subtle p-3 rounded-md text-base font-mono text-text-secondary overflow-x-auto">
              <pre>{JSON.stringify(lead.metadata, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-base text-text-muted">
              No additional metadata found.
            </p>
          )}
        </Card>
      </div>

      {/* Related Calls Section */}
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Call History
        </h3>
        {lead.calls && lead.calls.length > 0 ? (
          <div className="flex flex-col gap-3">
            {lead.calls.map((call) => (
              <div
                key={call.id}
                className="p-3 border border-surface-border rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-base font-medium">
                    {formatDate(call.startedAt)}
                  </p>
                  <p className="text-base text-text-muted uppercase mt-0.5">
                    {call.status}
                  </p>
                </div>
                <button
                  onClick={() =>
                    router.push(`/campaigns/${campaignId}/calls/${call.id}`)
                  }
                  className="text-base font-medium text-brand-600 hover:underline"
                >
                  View Call Details
                </button>
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
