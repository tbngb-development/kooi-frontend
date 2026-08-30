"use client";

import { CallStatusBadge } from "@/components/call-history/CallStatusBadge";
import { TranscriptViewer } from "@/components/call-history/TranscriptViewer";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCall } from "@/hooks/useCalls";
import { formatDateTime } from "@/lib/utils/formatDate";
import { formatDuration } from "@/lib/utils/formatDuration";
import type { CallAnalysis, Disposition, LeadTemperature } from "@/types";
import {
  ChevronLeft,
  Clock,
  MessageSquare,
  Mic,
  Phone,
  User,
  Thermometer,
  Target,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// ─── Disposition label map ───────────────────────────────────────────────────

const dispositionLabel: Record<Disposition, string> = {
  INTERESTED_SEND_DETAILS: "Send Details",
  QUALIFIED_CONSULTANT_FOLLOWUP: "Consultant Follow-up",
  SITE_VISIT_INTEREST: "Site Visit Interest",
  INTERESTED_GENERAL: "General Interest",
  FOLLOWUP_REQUESTED: "Follow-up Requested",
  NOT_INTERESTED: "Not Interested",
  DO_NOT_CALL: "Do Not Call",
  WRONG_NUMBER: "Wrong Number",
  ALREADY_PURCHASED: "Already Purchased",
  BROKER: "Broker / Channel Partner",
  LANGUAGE_CALLBACK_REQUIRED: "Language Callback Required",
  CALL_ENDED_BY_CUSTOMER: "Ended by Customer",
  CALL_ENDED_ABUSIVE: "Abusive Call",
  NO_RESPONSE: "No Response",
  CALL_DROPPED: "Call Dropped",
};

const temperatureStyle: Record<LeadTemperature, string> = {
  HOT: "bg-error-100 text-error-700",
  WARM: "bg-warning-100 text-warning-700",
  NURTURE: "bg-info-100 text-info-700",
  COLD: "bg-surface-subtle text-text-muted",
  NOT_APPLICABLE: "bg-surface-subtle text-text-muted",
};

// ─── Call Analysis Section ───────────────────────────────────────────────────

function AnalysisRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-surface-border last:border-0">
      <span className="text-base text-text-muted shrink-0 w-40">{label}</span>
      <span className="text-base text-text-primary text-right">
        {value &&
        value !== "NOT_SHARED" &&
        value !== "NOT_ASKED" &&
        value !== "NONE"
          ? value
          : "—"}
      </span>
    </div>
  );
}

function CallAnalysisSection({ analysis }: { analysis: CallAnalysis }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Target size={15} className="text-brand-600" />
        <h3 className="text-base font-semibold text-text-primary">
          Call Analysis
        </h3>
      </div>

      {/* Outcome row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {analysis.disposition && (
          <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-base font-medium text-brand-700 border border-brand-100">
            {dispositionLabel[analysis.disposition]}
          </span>
        )}
        {analysis.leadTemperature && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-base font-medium ${temperatureStyle[analysis.leadTemperature]}`}
          >
            <Thermometer size={10} className="mr-1" />
            {analysis.leadTemperature}
          </span>
        )}
        {analysis.doNotCall === "YES" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-error-100 px-2.5 py-1 text-base font-medium text-error-700">
            <AlertCircle size={10} />
            Do Not Call
          </span>
        )}
      </div>

      {/* Qualification details */}
      <div className="mb-4">
        <p className="text-base font-medium text-text-muted uppercase tracking-wide mb-2">
          Lead Qualification
        </p>
        <AnalysisRow
          label="Configuration"
          value={analysis.preferredConfiguration}
        />
        <AnalysisRow label="Budget Range" value={analysis.budgetRange} />
        <AnalysisRow
          label="Purchase Timeline"
          value={analysis.purchaseTimeline}
        />
        <AnalysisRow
          label="Purchase Purpose"
          value={analysis.purchasePurpose}
        />
        <AnalysisRow label="Location Match" value={analysis.locationMatch} />
        {analysis.customerLocationPref && (
          <AnalysisRow
            label="Customer Location Pref"
            value={analysis.customerLocationPref}
          />
        )}
      </div>

      {/* Next action */}
      <div className="mb-4">
        <p className="text-base font-medium text-text-muted uppercase tracking-wide mb-2">
          Next Action
        </p>
        <AnalysisRow label="Next Action" value={analysis.preferredNextAction} />
        <AnalysisRow
          label="Contact Channel"
          value={analysis.preferredContactChannel}
        />
        <AnalysisRow
          label="Follow-up Schedule"
          value={analysis.followupSchedule}
        />
      </div>

      {/* Compliance */}
      <div>
        <p className="text-base font-medium text-text-muted uppercase tracking-wide mb-2">
          Compliance
        </p>
        <AnalysisRow
          label="Language Support"
          value={analysis.languageSupportRequired}
        />
      </div>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CampaignCallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.callId);
  const campaignId = String(params.id); // parent [id] segment

  const { data: call, isLoading: callLoading } = useCall(id);

  if (callLoading) return <PageSpinner />;
  if (!call)
    return <p className="text-text-muted text-base">Call not found.</p>;

  const analysis = call.callAnalysis ?? null;

  // ─── Back handler: preserve filters/pagination via history ───
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(`/campaigns/${campaignId}/calls`);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-base text-text-muted hover:text-text-primary mb-3 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          Back to Calls
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">
            Call with {call.lead?.name ?? "Unknown"}
          </h2>
          <CallStatusBadge status={call.status} />
        </div>
        <p className="text-base text-text-muted mt-1">
          Campaign:{" "}
          <Link
            href={`/campaigns/${call.campaignId}`}
            className="text-brand-600 hover:underline"
          >
            {call.campaign?.name ?? "Unknown"}
          </Link>
        </p>
      </div>

      {/* Call info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="sm" className="flex items-center gap-2.5">
          <User size={15} className="text-text-muted shrink-0" />
          <div>
            <p className="text-base text-text-muted">Lead</p>
            <p className="text-base font-medium text-text-primary">
              {call.lead?.phone ?? "—"}
            </p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-2.5">
          <Phone size={15} className="text-text-muted shrink-0" />
          <div>
            <p className="text-base text-text-muted">Phone</p>
            <p className="text-base font-medium text-text-primary font-mono">
              {call.lead?.phone ?? "—"}
            </p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-2.5">
          <Clock size={15} className="text-text-muted shrink-0" />
          <div>
            <p className="text-base text-text-muted">Duration</p>
            <p className="text-base font-medium text-text-primary">
              {formatDuration(call.duration)}
            </p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-2.5">
          <Thermometer size={15} className="text-text-muted shrink-0" />
          <div>
            <p className="text-base text-text-muted">Temperature</p>
            <p className="text-base font-medium text-text-primary">
              {analysis?.leadTemperature ?? "—"}
            </p>
          </div>
        </Card>
      </div>

      {/* Timestamps */}
      <Card padding="sm">
        <div className="flex items-center gap-6 text-base text-text-muted">
          {call.startedAt && (
            <span>Started: {formatDateTime(call.startedAt)}</span>
          )}
          {call.endedAt && <span>Ended: {formatDateTime(call.endedAt)}</span>}
        </div>
      </Card>

      {/* Recording */}
      {call.recording && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Mic size={15} className="text-brand-600" />
            <h3 className="text-base font-semibold text-text-primary">
              Recording
            </h3>
          </div>
          <audio controls src={call.recording} className="w-full h-10" />
        </Card>
      )}

      {/* AI Summary */}
      {call.summary && (
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-3">
            AI Summary
          </h3>
          <p className="text-base text-text-secondary leading-relaxed">
            {call.summary}
          </p>
        </Card>
      )}

      {/* Analysis */}
      {analysis && <CallAnalysisSection analysis={analysis} />}

      {/* Transcript */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={15} className="text-brand-600" />
          <h3 className="text-base font-semibold text-text-primary">
            Transcript
          </h3>
        </div>
        {!call.transcript ? (
          <PageSpinner />
        ) : (
          <TranscriptViewer rawTranscript={call.transcript} />
        )}
      </Card>
    </div>
  );
}
