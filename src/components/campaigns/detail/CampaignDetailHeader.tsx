"use client";

import { Button } from "@/components/ui/Button";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { formatDate } from "@/lib/utils/formatDate";
import type { Campaign } from "@/types/campaign";
import { Bot, ChevronLeft, Upload } from "lucide-react";
import Link from "next/link";

interface CampaignDetailHeaderProps {
  campaign: Campaign;
  showUploadButton: boolean;
  onUploadClick: () => void;
}

export function CampaignDetailHeader({
  campaign,
  showUploadButton,
  onUploadClick,
}: CampaignDetailHeaderProps) {
  return (
    <div>
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-3 transition-colors"
      >
        <ChevronLeft size={14} />
        Back to Campaigns
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: campaign meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              {campaign.name}
            </h2>
            <CampaignStatusBadge status={campaign.status} />
          </div>

          {campaign.description && (
            <p className="text-sm text-text-muted mt-1.5 max-w-2xl">
              {campaign.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2.5 text-sm text-text-muted flex-wrap">
            <span className="flex items-center gap-1.5">
              <Bot size={13} />
              {campaign.assistant?.name ?? "Unknown"}
            </span>
            <span>Created {formatDate(campaign.createdAt)}</span>
          </div>
        </div>

        {/* Right: primary action */}
        {showUploadButton && (
          <Button
            leftIcon={<Upload size={14} />}
            onClick={onUploadClick}
            className="shrink-0"
          >
            Upload Leads
          </Button>
        )}
      </div>
    </div>
  );
}
