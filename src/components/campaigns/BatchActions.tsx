"use client";

import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { RunBatchDrawer } from "@/components/campaigns/RunBatchDrawer";
import { UploadLeadsDrawer } from "@/components/campaigns/UploadLeadsDrawer";
import { useStopBatch } from "@/hooks/useBatches";
import type { BatchStatus } from "@/types/batch";
import { Download, Play, RotateCcw, Square } from "lucide-react";
import { useState } from "react";

interface BatchActionsProps {
  campaignId: string;
  batchId: string;
  status: BatchStatus;
  fileUrl: string | null;
}

/**
 * Row-level batch actions.
 * - CREATED              → Run (opens RunBatchDrawer to pick immediate or scheduled)
 * - RUNNING / SCHEDULED  → Stop (with confirmation)
 * - STOPPED              → Resume (opens UploadLeadsDrawer in resume mode)
 * - COMPLETED / FAILED   → Download original file (if available)
 */
export function BatchActions({
  campaignId,
  batchId,
  status,
  fileUrl,
}: BatchActionsProps) {
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showRunDrawer, setShowRunDrawer] = useState(false);
  const [showResumeDrawer, setShowResumeDrawer] = useState(false);

  const stopBatch = useStopBatch(campaignId);

  const isCreated = status === "CREATED";
  const isRunning = status === "RUNNING" || status === "SCHEDULED";
  const isStopped = status === "STOPPED";

  const handleStop = () => {
    stopBatch.mutate(batchId);
    setShowStopConfirm(false);
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {/* Core batch action buttons */}
        {isCreated && (
          <Button
            size="sm"
            leftIcon={<Play size={12} />}
            onClick={() => setShowRunDrawer(true)}
          >
            Run
          </Button>
        )}

        {isRunning && (
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Square size={12} />}
            onClick={() => setShowStopConfirm(true)}
            loading={stopBatch.isPending}
          >
            Stop
          </Button>
        )}

        {isStopped && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw size={12} />}
            onClick={() => setShowResumeDrawer(true)}
          >
            Resume
          </Button>
        )}

        {/* View / Download original file option */}
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Download original file"
          >
            <Button size="sm" variant="outline" className="px-2">
              <Download size={12} />
            </Button>
          </a>
        )}

        {!isCreated && !isRunning && !isStopped && !fileUrl && (
          <span className="text-xs text-text-placeholder">—</span>
        )}
      </div>

      {/* CREATED → pick Run Now / Schedule for existing batch */}
      <RunBatchDrawer
        isOpen={showRunDrawer}
        onClose={() => setShowRunDrawer(false)}
        campaignId={campaignId}
        batchId={batchId}
      />

      {/* STOPPED → resume creates new batch, then run/schedule */}
      <UploadLeadsDrawer
        isOpen={showResumeDrawer}
        onClose={() => setShowResumeDrawer(false)}
        campaignId={campaignId}
        resumeBatchId={batchId}
      />

      {showStopConfirm && (
        <ConfirmModal
          isOpen={showStopConfirm}
          title="Stop Batch Progress?"
          description="In-flight voice calls will proceed to complete. Only queued pending calls will be halted."
          confirmLabel="Stop Queue"
          variant="danger"
          onConfirm={handleStop}
          onClose={() => setShowStopConfirm(false)}
        />
      )}
    </>
  );
}
