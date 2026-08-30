"use client";

import { useState } from "react";
import { Play, CalendarClock, Square, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  useRunBatch,
  useStopBatch,
  useResumeBatch,
  useDeleteBatch,
  useScheduleBatch,
} from "@/hooks/useBatches";
import type { BatchStatus } from "@/types/batch";

interface BatchActionsProps {
  campaignId: string;
  batchId: string;
  status: BatchStatus;
}

/**
 * Converts a JavaScript Date to Bolna-compliant ISO 8601 string
 * with a numeric offset (e.g., "2026-08-28T11:35:00+05:30")
 * Bolna rejects the "Z" suffix with a 500 error.
 */
function toBolnaISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Timezone offset calculation (e.g., -330 mins for IST => +05:30)
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}

/**
 * Converts a Date to "YYYY-MM-DDTHH:mm" for <input type="datetime-local" />
 * in the user's local timezone.
 */
function toDateTimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BatchActions({
  campaignId,
  batchId,
  status,
}: BatchActionsProps) {
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const runBatch = useRunBatch(campaignId);
  const stopBatch = useStopBatch(campaignId);
  const resumeBatch = useResumeBatch(campaignId);
  const deleteBatch = useDeleteBatch(campaignId);
  const scheduleBatch = useScheduleBatch(campaignId);

  const isCreated = status === "CREATED";
  const isRunning = status === "RUNNING" || status === "SCHEDULED";
  const isStopped = status === "STOPPED";
  const isTerminal = status === "COMPLETED" || status === "FAILED";

  const handleRun = () => runBatch.mutate(batchId);

  const handleStop = () => {
    stopBatch.mutate(batchId);
    setShowStopConfirm(false);
  };

  const handleResume = () => resumeBatch.mutate(batchId);

  const handleDelete = () => {
    deleteBatch.mutate(batchId);
    setShowDeleteConfirm(false);
  };

  const handleSchedule = (date: Date) => {
    const isoString = toBolnaISO(date);
    scheduleBatch.mutate({ batchId, scheduledAt: isoString });
    setShowSchedulePicker(false);
  };

  return (
    <div className="flex items-center gap-2">
      {isCreated && (
        <>
          <Button
            size="sm"
            leftIcon={<Play size={12} />}
            onClick={handleRun}
            loading={runBatch.isPending}
          >
            Run Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CalendarClock size={12} />}
            onClick={() => setShowSchedulePicker(true)}
          >
            Schedule
          </Button>
        </>
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

      {(isTerminal || isCreated || isStopped) && (
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Trash2 size={12} className="text-red-500" />}
          onClick={() => setShowDeleteConfirm(true)}
          loading={deleteBatch.isPending}
        >
          Delete
        </Button>
      )}

      {showSchedulePicker && (
        <ScheduleModal
          onConfirm={handleSchedule}
          onCancel={() => setShowSchedulePicker(false)}
        />
      )}

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

      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete Batch?"
          description="This action clears the selected lead batch data permanently. Halted call metrics remain stored on historical endpoints."
          confirmLabel="Delete Batch"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// ─── Schedule Modal ──────────────────────────────────────────────────────────

interface ScheduleModalProps {
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

function ScheduleModal({ onConfirm, onCancel }: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [minDateString] = useState(() => {
    const minDateObj = new Date(Date.now() + 3 * 60 * 1000);
    return toDateTimeLocalString(minDateObj);
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setSelectedDate(null);
      return;
    }
    const d = new Date(e.target.value);
    if (d.getTime() < Date.now() + 2 * 60 * 1000) {
      setError("Schedule time must be at least 2 minutes in the future.");
    } else {
      setError(null);
    }
    setSelectedDate(d);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;
    if (selectedDate.getTime() < Date.now() + 2 * 60 * 1000) {
      setError("Schedule time must be at least 2 minutes in the future.");
      return;
    }
    onConfirm(selectedDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-zinc-900 border border-zinc-800 p-6 shadow-xl text-white">
        <h3 className="mb-2 text-base font-semibold">Schedule Batch Trigger</h3>
        <p className="mb-4 text-base text-zinc-400">
          Select a precise target trigger date and time. Scheduler execution
          rounds dynamically to match backend scheduling intervals.
        </p>

        <input
          type="datetime-local"
          className="mb-2 w-full rounded-lg bg-zinc-950 border border-zinc-800 text-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
          min={minDateString}
          onChange={handleDateChange}
        />

        {error && <p className="mb-4 text-base text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDate || !!error}>
            Schedule Trigger
          </Button>
        </div>
      </div>
    </div>
  );
}
