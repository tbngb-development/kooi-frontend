"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatRelative } from "@/lib/utils/formatDate";
import type { DashboardActivity, DashboardQualifiedLead } from "@/types/dashboard";
import { UserCheck } from "lucide-react";

// ─── Disposition label map ────────────────────────────────────────────────────

const dispositionLabel: Record<string, string> = {
  QUALIFIED_CONSULTANT_FOLLOWUP: "Consultant Follow-up",
  SITE_VISIT_INTEREST: "Site Visit Interest",
  INTERESTED_SEND_DETAILS: "Send Details",
  INTERESTED_GENERAL: "General Interest",
};

const temperatureColor: Record<string, string> = {
  HOT: "bg-error-50 text-error-600 border border-error-100",
  WARM: "bg-warning-50 text-warning-600 border border-warning-100",
  NURTURE: "bg-info-50 text-info-600 border border-info-100",
  COLD: "bg-surface-subtle text-text-muted border border-surface-border",
  NOT_APPLICABLE:
    "bg-surface-subtle text-text-muted border border-surface-border",
};

// ─── Single item ──────────────────────────────────────────────────────────────

function QualifiedLeadItem({ lead }: { lead: DashboardQualifiedLead }) {
  // Safe Fallback Resolution to prevent Type 'null' Index Errors
  const tempKey = lead.leadTemperature ?? "NOT_APPLICABLE";
  const dispKey = lead.disposition ?? "UNKNOWN";

  const tempColor =
    temperatureColor[tempKey] ??
    "bg-surface-subtle text-text-muted border border-surface-border";

  const mappedDisposition = dispositionLabel[dispKey] ?? dispKey;

  return (
    <div className="flex items-start gap-3 px-5 py-3">
      {/* Icon */}
      <div className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 bg-success-50 border border-success-100 text-success-600">
        <UserCheck size={13} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-base font-medium text-text-primary">
            {lead.name ?? "Anonymous Contact"}
          </p>
          {lead.leadTemperature && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-base font-semibold ${tempColor}`}
            >
              {lead.leadTemperature}
            </span>
          )}
        </div>
        <p className="text-base text-text-secondary mt-1">
          {mappedDisposition} ·{" "}
          <span className="text-text-muted">{lead.campaign}</span>
        </p>
        <p className="text-base text-text-placeholder mt-0.5">
          {formatRelative(lead.qualifiedAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ActivityFeedProps {
  data: DashboardActivity;
}

export function ActivityFeed({ data }: ActivityFeedProps) {
  const { qualifiedLeads } = data;

  return (
    <Card padding="none" className="border-surface-border bg-surface">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-base font-bold text-text-primary">
          Qualified Leads
        </CardTitle>
      </CardHeader>

      {qualifiedLeads.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-base text-text-muted">
            No qualified leads yet.
          </p>
          <p className="text-base text-text-placeholder mt-1">
            Leads that agree to a callback or site visit will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-surface-border">
          {qualifiedLeads.slice(0, 8).map((lead) => (
            <QualifiedLeadItem key={lead.leadId} lead={lead} />
          ))}
        </div>
      )}
    </Card>
  );
}
