"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatRelative } from "@/lib/utils/formatDate";
import { humanizeEnum } from "@/lib/utils/humanize";
import type {
  DashboardRecentActivity,
  QualifiedLeadItem,
} from "@/types/dashboard";
import { UserCheck } from "lucide-react";

const TEMP_COLOR: Record<string, string> = {
  HOT: "bg-error-50 text-error-600 border border-error-100",
  WARM: "bg-warning-50 text-warning-600 border border-warning-100",
  NURTURE: "bg-info-50 text-info-600 border border-info-100",
  COLD: "bg-surface-subtle text-text-muted border border-surface-border",
};

function LeadRow({ lead }: { lead: QualifiedLeadItem }) {
  const tempClass = lead.leadTemperature
    ? (TEMP_COLOR[lead.leadTemperature] ??
      "bg-surface-subtle text-text-muted border border-surface-border")
    : null;

  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 bg-success-50 border border-success-100 text-success-600">
        <UserCheck size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-base font-medium text-text-primary truncate">
            {lead.name ?? "Anonymous Contact"}
          </p>
          {lead.leadTemperature && tempClass && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tempClass}`}
            >
              {lead.leadTemperature}
            </span>
          )}
        </div>
        <p className="text-base text-text-secondary mt-1">
          {lead.disposition ? humanizeEnum(lead.disposition) : "Qualified"} ·{" "}
          <span className="text-text-muted">{lead.campaign}</span>
        </p>
        <p className="text-xs text-text-placeholder mt-0.5">
          {formatRelative(lead.qualifiedAt)}
        </p>
      </div>
    </div>
  );
}

interface Props {
  data: DashboardRecentActivity;
}

export function ActivityFeed({ data }: Props) {
  const { qualifiedLeads } = data;

  return (
    <Card padding="none" className="border-surface-border bg-surface">
      <CardHeader className="px-5 pt-5 pb-3 mb-0">
        <CardTitle className="text-base font-bold text-text-primary">
          Recently Qualified Leads
        </CardTitle>
      </CardHeader>

      {qualifiedLeads.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-base text-text-muted">No qualified leads yet.</p>
          <p className="text-base text-text-placeholder mt-1">
            Leads that agree to a callback or site visit will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-surface-border">
          {qualifiedLeads.map((l) => (
            <LeadRow key={l.leadId} lead={l} />
          ))}
        </div>
      )}
    </Card>
  );
}
