"use client";

import { useState } from "react";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignActions } from "@/components/campaigns/CampaignActions";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { UploadLeadsModal } from "@/components/campaigns/UploadLeadsModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCampaign, useCampaignPerformance } from "@/hooks/useCampaigns"; // <─── Updated hook import
import { formatDate } from "@/lib/utils/formatDate";
import {
  Bot,
  CalendarDays,
  ChevronLeft,
  Flame,
  Info,
  Phone,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { CampaignStatus } from "@/types";

const UPLOAD_ALLOWED_STATUSES: CampaignStatus[] = [
  "DRAFT",
  "PAUSED",
  "COMPLETED",
];

const UPLOAD_HINT: Partial<Record<CampaignStatus, string>> = {
  DRAFT: "Upload leads to get this campaign ready to start.",
  PAUSED:
    "Campaign is paused. Any leads you upload will be called when you resume.",
  COMPLETED:
    'Campaign finished. Upload new leads and click "Run Now" to run another batch.',
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { user } = useAuthStore();
  const canEdit = user?.role !== "USER";

  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: campaign, isLoading } = useCampaign(id, true);
  console.log("campaign list: ", campaign)

  // ─── Query Performance Metrics ───
  const { data: performance, isLoading: isLoadingPerf } =
    useCampaignPerformance(id, !isLoading && !!campaign);

  if (isLoading) return <PageSpinner />;
  if (!campaign)
    return <p className="text-text-muted text-base">Campaign not found.</p>;

  const showUploadButton =
    canEdit && UPLOAD_ALLOWED_STATUSES.includes(campaign.status);
  const uploaderHint = UPLOAD_HINT[campaign.status];

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-base text-text-muted hover:text-text-primary mb-3 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Campaigns
        </Link>

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-text-primary">
                {campaign.name}
              </h2>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            {campaign.description && (
              <p className="text-base text-text-muted mt-1">
                {campaign.description}
              </p>
            )}
            <div className="flex flex-col gap-1.5 mt-2.5">
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <Bot size={12} />
                  {campaign.assistant.name}
                </span>
                <span>Created {formatDate(campaign.createdAt)}</span>
                {campaign.startedAt && (
                  <span>Started {formatDate(campaign.startedAt)}</span>
                )}
              </div>

              {campaign.status === "SCHEDULED" && campaign.scheduledAt && (
                <div className="flex items-center gap-1.5 text-sm text-brand-600 font-medium">
                  <CalendarDays size={13} />
                  <span>
                    Scheduled to launch on {formatDate(campaign.scheduledAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {canEdit && (
            <CampaignActions
              campaignId={campaign.id}
              status={campaign.status}
            />
          )}
        </div>
      </div>

      {/* ─── Quick Action Cards (3 in a row) ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickActionCard
          href={`/campaigns/${id}/leads`}
          icon={<Users size={18} />}
          iconBg="bg-info-100 group-hover:bg-info-500"
          iconColor="text-info-600"
          title="View Leads"
          subtitle={`${campaign.totalLeads} total lead${campaign.totalLeads !== 1 ? "s" : ""}`}
        />
        <QuickActionCard
          href={`/campaigns/${id}/calls`}
          icon={<Phone size={18} />}
          iconBg="bg-secondary-50 group-hover:bg-secondary-500"
          iconColor="text-secondary-600"
          title="View Calls"
          subtitle={`${campaign.calledLeads} call${campaign.calledLeads !== 1 ? "s" : ""} made`}
        />
        <QuickActionCard
          href={`/campaigns/${id}/calls?leadTemperature=HOT,WARM`}
          icon={<Flame size={18} />}
          iconBg="bg-amber-100 group-hover:bg-amber-500"
          iconColor="text-amber-600"
          title="Qualified Calls"
          subtitle={`${campaign.successLeads} qualified (HOT / WARM)`}
        />
      </div>

      {/* ─── Stats (Performance Overview) ─────────────────────────────── */}
      <CampaignStats
        campaign={campaign}
        performance={performance ?? null}
        isLoadingPerformance={isLoadingPerf}
      />

      {/* ─── Upload Button + Hint ──────────────────────────────────────── */}
      {showUploadButton && (
        <Card>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-text-primary">
                Upload Leads
              </h3>
              {uploaderHint && (
                <div className="flex items-start gap-2 mt-2">
                  <Info size={13} className="text-text-muted shrink-0 mt-0.5" />
                  <p className="text-sm text-text-muted">{uploaderHint}</p>
                </div>
              )}
            </div>
            <Button
              leftIcon={<Upload size={14} />}
              onClick={() => setUploadOpen(true)}
            >
              Upload File
            </Button>
          </div>
        </Card>
      )}

      {/* ─── Upload Modal ──────────────────────────────────────────────── */}
      <UploadLeadsModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        campaignId={id}
      />
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group h-full">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors shrink-0 ${iconBg}`}
          >
            <span
              className={`${iconColor} group-hover:text-white transition-colors`}
            >
              {icon}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-primary">{title}</p>
            <p className="text-sm text-text-muted truncate">{subtitle}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
