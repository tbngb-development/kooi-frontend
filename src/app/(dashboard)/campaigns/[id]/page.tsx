// src/app/(dashboard)/campaigns/[id]/page.tsx

'use client';

import { CampaignStats } from '@/components/campaigns/CampaignStats';
import { CampaignActions } from '@/components/campaigns/CampaignActions';
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge';
import { CSVUploader } from '@/components/campaigns/CSVUploader';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useCampaign } from '@/hooks/useCampaigns';
import { formatDate } from '@/lib/utils/formatDate';
import { Bot, ChevronLeft, Info, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import type { CampaignStatus } from '@/types';

// Statuses where uploading new leads is allowed
const UPLOAD_ALLOWED_STATUSES: CampaignStatus[] = [
  'DRAFT',
  'PAUSED',
  'COMPLETED',
];

// Contextual hint copy per status shown above the uploader
const UPLOAD_HINT: Partial<Record<CampaignStatus, string>> = {
  DRAFT: 'Upload leads to get this campaign ready to start.',
  PAUSED:
    'Campaign is paused. Any leads you upload will be called when you resume.',
  COMPLETED:
    'Campaign finished. Upload new leads and click "Start Campaign" to run another batch.',
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { user } = useAuthStore();
  const canEdit = user?.role !== 'USER';

  // Poll every 5s while RUNNING so stats + status stay live
  const { data: campaign, isLoading } = useCampaign(id, true);

  if (isLoading) return <PageSpinner />;
  if (!campaign)
    return <p className="text-text-muted text-sm">Campaign not found.</p>;

  const showUploader =
    canEdit && UPLOAD_ALLOWED_STATUSES.includes(campaign.status);

  const uploaderHint = UPLOAD_HINT[campaign.status];

  return (
    <div className="flex flex-col gap-5">
      {/* Back + Header */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-3 transition-colors"
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
              <p className="text-sm text-text-muted mt-1">
                {campaign.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Bot size={12} />
                {campaign.assistant.name}
              </span>
              <span>Created {formatDate(campaign.createdAt)}</span>
              {campaign.startedAt && (
                <span>Started {formatDate(campaign.startedAt)}</span>
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

      {/* Stats */}
      <CampaignStats campaign={campaign} />

      {/* Upload CSV — hidden while RUNNING or FAILED */}
      {showUploader && (
        <Card>
          <div className="flex items-start justify-between gap-2 mb-4">
            <h3 className="text-sm font-semibold text-text-primary">
              Upload Leads
            </h3>
          </div>

          {/* Contextual hint banner */}
          {uploaderHint && (
            <div className="flex items-start gap-2 rounded-md bg-surface-subtle border border-surface-border p-3 mb-4">
              <Info size={13} className="text-text-muted shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">{uploaderHint}</p>
            </div>
          )}

          <CSVUploader campaignId={campaign.id} />
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href={`/campaigns/${id}/leads`}>
          <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-100 group-hover:bg-info-500 transition-colors">
                <Users
                  size={18}
                  className="text-info-600 group-hover:text-white transition-colors"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  View Leads
                </p>
                <p className="text-xs text-text-muted">
                  {campaign.totalLeads} total leads
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href={`/campaigns/${id}/calls`}>
          <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-50 group-hover:bg-secondary-500 transition-colors">
                <Phone
                  size={18}
                  className="text-secondary-600 group-hover:text-white transition-colors"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  View Calls
                </p>
                <p className="text-xs text-text-muted">
                  {campaign.calledLeads} calls made
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}