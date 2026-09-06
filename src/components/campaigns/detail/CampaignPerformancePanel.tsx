"use client";

import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { BatchList } from "@/components/campaigns/BatchList";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useBatches } from "@/hooks/useBatches";
import { useCampaignPerformance } from "@/hooks/useCampaigns";
import type { Campaign } from "@/types/campaign";
import { BarChart3, Info } from "lucide-react";
import { useMemo, useState } from "react";
import type { CampaignStatus } from "@/types/campaign";

interface CampaignPerformancePanelProps {
  campaign: Campaign;
}

const UPLOAD_HINT: Partial<Record<CampaignStatus, string>> = {
  DRAFT: "Upload leads to create your first batch.",
  RUNNING: "Campaign is active. Upload a new batch to add more leads.",
  COMPLETED: "Campaign finished. Upload new leads to start a fresh batch.",
};

const ALL_BATCHES = "__ALL__";

/**
 * Unified performance + batch management panel.
 * - Filter dropdown scopes performance stats (all batches or a single batch).
 * - Batch table remains full below stats.
 *
 * TODO: Once useCampaignPerformance accepts a batchId param, pass `selectedBatchId`
 *       to scope the API call server-side. Currently panel refetches on any change.
 */
export function CampaignPerformancePanel({
  campaign,
}: CampaignPerformancePanelProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(ALL_BATCHES);

  const { data: batches } = useBatches(campaign.id);
  const { data: performance, isLoading: isLoadingPerf } =
    useCampaignPerformance(campaign.id, true);
  // TODO: pass { batchId: selectedBatchId === ALL_BATCHES ? undefined : selectedBatchId }

  // Build dropdown options: "All Batches" + one per batch
  const batchOptions = useMemo(() => {
    const opts = [{ value: ALL_BATCHES, label: "All Batches" }];
    if (batches) {
      batches.forEach((b) => {
        const label = b.fileName ? b.fileName : `Batch ${b.id.slice(0, 6)}`;
        opts.push({ value: b.id, label });
      });
    }
    return opts;
  }, [batches]);

  const isFiltered = selectedBatchId !== ALL_BATCHES;
  const uploaderHint = UPLOAD_HINT[campaign.status];

  return (
    <Card>
      {/* ─── Panel Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Performance & Batches
            </h3>
            <p className="text-xs text-text-muted">
              {isFiltered
                ? "Viewing metrics for the selected batch"
                : "Viewing aggregate metrics across all batches"}
            </p>
          </div>
        </div>

        {/* Batch filter dropdown */}
        <div className="w-full sm:w-64">
          <Select
            options={batchOptions}
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            aria-label="Filter performance by batch"
          />
        </div>
      </div>

      {/* ─── Performance Stats ─────────────────────────────────────── */}
      <CampaignStats
        campaign={campaign}
        performance={performance ?? null}
        isLoadingPerformance={isLoadingPerf}
      />

      {/* ─── Divider + Hint ────────────────────────────────────────── */}
      <div className="mt-8 pt-6 border-t border-surface-border">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-text-primary">
              Lead Batches
            </h4>
            {uploaderHint && (
              <div className="flex items-start gap-2 mt-1.5">
                <Info size={13} className="text-text-muted shrink-0 mt-0.5" />
                <p className="text-sm text-text-muted">{uploaderHint}</p>
              </div>
            )}
          </div>
        </div>

        <BatchList campaignId={campaign.id} />
      </div>
    </Card>
  );
}
