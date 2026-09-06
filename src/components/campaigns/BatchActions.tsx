"use client";

import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { RunBatchDrawer } from "@/components/campaigns/RunBatchDrawer";
import { useResumeBatch, useStopBatch } from "@/hooks/useBatches";
import type { BatchStatus } from "@/types/batch";
import { Play, RotateCcw, Square } from "lucide-react";
import { useState } from "react";

interface BatchActionsProps {
  campaignId: string;
  batchId: string;
  status: BatchStatus;
}

/**
 * Row-level batch actions.
 * V1 rules:
 * - CREATED              → Run (opens drawer to pick immediate or scheduled)
 * - RUNNING / SCHEDULED  → Stop (with confirmation)
 * - STOPPED              → Resume (creates a new CREATED batch)
 * - COMPLETED / FAILED   → No action
 */
export function BatchActions({
  campaignId,
  batchId,
  status,
}: BatchActionsProps) {
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showRunDrawer, setShowRunDrawer] = useState(false);

  const stopBatch = useStopBatch(campaignId);
  const resumeBatch = useResumeBatch(campaignId);

  const isCreated = status === "CREATED";
  const isRunning = status === "RUNNING" || status === "SCHEDULED";
  const isStopped = status === "STOPPED";

  const handleStop = () => {
    stopBatch.mutate(batchId);
    setShowStopConfirm(false);
  };

  const handleResume = () => resumeBatch.mutate(batchId);

  // Nothing actionable for COMPLETED / FAILED
  if (!isCreated && !isRunning && !isStopped) {
    return <span className="text-xs text-text-placeholder">—</span>;
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2">
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
            onClick={handleResume}
            loading={resumeBatch.isPending}
          >
            Resume
          </Button>
        )}
      </div>

      {/* Run drawer — pick Run Now or Schedule */}
      <RunBatchDrawer
        isOpen={showRunDrawer}
        onClose={() => setShowRunDrawer(false)}
        campaignId={campaignId}
        batchId={batchId}
      />

      {/* Stop confirmation */}
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
