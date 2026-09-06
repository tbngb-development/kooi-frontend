"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { useRunBatch, useScheduleBatch } from "@/hooks/useBatches";
import { toBolnaISO, toDateTimeLocalString } from "@/lib/utils/date";
import { CalendarClock, Play, Rocket } from "lucide-react";
import { useMemo, useState } from "react";

interface RunBatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  batchId: string;
}

/**
 * Standalone drawer to trigger a CREATED batch.
 * Reuses the same "Run Now / Schedule for later" UX as the upload drawer.
 */
export function RunBatchDrawer({
  isOpen,
  onClose,
  campaignId,
  batchId,
}: RunBatchDrawerProps) {
  const [mode, setMode] = useState<"run" | "schedule">("run");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBatch = useRunBatch(campaignId);
  const scheduleBatch = useScheduleBatch(campaignId);

  const minDateString = useMemo(
    // eslint-disable-next-line react-hooks/purity
    () => toDateTimeLocalString(new Date(Date.now() + 3 * 60 * 1000)),
    [],
  );

  const isBusy = runBatch.isPending || scheduleBatch.isPending;

  const handleClose = () => {
    if (isBusy) return;
    setMode("run");
    setScheduledAt(null);
    setError(null);
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setScheduledAt(null);
      return;
    }
    const d = new Date(e.target.value);
    if (d.getTime() < Date.now() + 2 * 60 * 1000) {
      setError("Schedule time must be at least 2 minutes in the future.");
    } else {
      setError(null);
    }
    setScheduledAt(d);
  };

  const handleConfirm = () => {
    if (mode === "run") {
      runBatch.mutate(batchId, { onSuccess: handleClose });
    } else if (scheduledAt && !error) {
      scheduleBatch.mutate(
        { batchId, scheduledAt: toBolnaISO(scheduledAt) },
        { onSuccess: handleClose },
      );
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Trigger Batch"
      description="Choose to run this batch immediately or schedule it for later."
      size="md"
      disableBackdropClose={isBusy}
    >
      <div className="space-y-5">
        {/* Info block */}
        <div className="flex items-center gap-3 rounded-lg bg-brand-50 border border-brand-100 p-4">
          <Rocket className="h-6 w-6 shrink-0 text-brand-600" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-brand-800">
              Ready to Launch
            </h3>
            <p className="text-xs text-brand-700 mt-0.5 font-mono truncate">
              Batch ID: {batchId}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border border-surface-border bg-surface hover:bg-surface-hover transition-colors">
          <input
            type="checkbox"
            checked={mode === "schedule"}
            onChange={(e) => {
              setMode(e.target.checked ? "schedule" : "run");
              setError(null);
            }}
            className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"
            disabled={isBusy}
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-text-primary">
              Schedule for later
            </span>
            <p className="text-xs text-text-muted mt-0.5">
              Uncheck to run this batch immediately.
            </p>
          </div>
        </label>

        {/* Datetime picker */}
        {mode === "schedule" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Trigger Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full h-10 rounded-md border border-surface-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              min={minDateString}
              onChange={handleDateChange}
              disabled={isBusy}
            />
            {error && <p className="text-xs text-error-600">{error}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isBusy}
            disabled={mode === "schedule" && (!scheduledAt || !!error)}
            leftIcon={
              mode === "run" ? <Play size={14} /> : <CalendarClock size={14} />
            }
          >
            {mode === "run" ? "Run Now" : "Schedule Batch"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
