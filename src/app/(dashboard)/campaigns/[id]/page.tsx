"use client";

import { CampaignDetailHeader } from "@/components/campaigns/detail/CampaignDetailHeader";
import { CampaignPerformancePanel } from "@/components/campaigns/detail/CampaignPerformancePanel";
import { CampaignQuickActions } from "@/components/campaigns/detail/CampaignQuickActions";
import { UploadLeadsDrawer } from "@/components/campaigns/UploadLeadsDrawer";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCampaign } from "@/hooks/useCampaigns";
import { useAuthStore } from "@/store/authStore";
import type { CampaignStatus } from "@/types/campaign";
import { useParams } from "next/navigation";
import { useState } from "react";

const UPLOAD_ALLOWED_STATUSES: CampaignStatus[] = [
  "DRAFT",
  "RUNNING",
  "COMPLETED",
];

export default function CampaignDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const { user, memberships, activeTenantId } = useAuthStore();
  const activeRole = memberships.find(
    (m) => m.tenantId === activeTenantId,
  )?.role;

  const canEdit =
    user?.isPlatformAdmin ||
    (activeRole !== undefined && activeRole !== "USER");

  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: campaign, isLoading } = useCampaign(id, true);

  if (isLoading) return <PageSpinner />;
  if (!campaign)
    return <p className="text-text-muted text-base">Campaign not found.</p>;

  const showUploadButton =
    canEdit && UPLOAD_ALLOWED_STATUSES.includes(campaign.status);

  return (
    <div className="flex flex-col gap-5">
      {/* Header with Upload CTA in top-right */}
      <CampaignDetailHeader
        campaign={campaign}
        showUploadButton={showUploadButton}
        onUploadClick={() => setUploadOpen(true)}
      />

      {/* Kept: 3 quick-action cards */}
      <CampaignQuickActions campaign={campaign} />

      {/* Merged: Filter + Performance + Batches */}
      <CampaignPerformancePanel campaign={campaign} />

      {/* Right-side drawer for upload → preview → run/schedule */}
      <UploadLeadsDrawer
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        campaignId={id}
      />
    </div>
  );
}
