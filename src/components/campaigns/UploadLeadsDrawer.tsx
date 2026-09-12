"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Spinner } from "@/components/ui/Spinner";
import { RetryConfigEditor } from "@/components/campaigns/RetryConfigEditor";
import {
  useCreateBatch,
  useResumeBatch,
  useRunBatch,
  useScheduleBatch,
} from "@/hooks/useBatches";
import { useParseCSV } from "@/hooks/useCampaigns";
import { toBolnaISO, toDateTimeLocalString } from "@/lib/utils/date";
import type { LeadBatch, RetryConfig } from "@/types/batch";
import type { ParseLeadsResult } from "@/types/campaign";
import {
  AlertTriangle,
  CalendarClock,
  Play,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────────────────── */
interface UploadLeadsDrawerProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
  /** When provided, the drawer skips upload/parse and jumps to run/schedule. */
  resumeBatchId?: string;
}

type Step = "upload" | "review";

/** Exact schema returned by the useResumeBatch hook mutation */
interface ResumeBatchResponse {
  originalBatchId: string;
  newBatch: LeadBatch;
  remainingLeads: number;
  message: string;
}

/* ──────────────────────────────────────────────────────────────────────────
   Main Drawer
   ────────────────────────────────────────────────────────────────────────── */
export function UploadLeadsDrawer({
  campaignId,
  isOpen,
  onClose,
  resumeBatchId,
}: UploadLeadsDrawerProps) {
  const isResumeMode = !!resumeBatchId;

  // ── state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParseLeadsResult | null>(null);
  const [retryConfig, setRetryConfig] = useState<RetryConfig | undefined>();

  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [minDateString, setMinDateString] = useState<string>("");

  // ── hooks ────────────────────────────────────────────────────────────
  const parseCSV = useParseCSV(campaignId);
  const createBatch = useCreateBatch(campaignId);
  const runBatch = useRunBatch(campaignId);
  const scheduleBatch = useScheduleBatch(campaignId);
  const resumeBatch = useResumeBatch(campaignId);

  const isBusy =
    createBatch.isPending ||
    runBatch.isPending ||
    scheduleBatch.isPending ||
    resumeBatch.isPending;

  // ── safely update current date limits on drawer open ──────────────────
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMinDateString(
        toDateTimeLocalString(new Date(Date.now() + 3 * 60 * 1000)),
      );
    }
  }, [isOpen]);

  // ── handlers ─────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    parseCSV.mutate(selected, {
      onSuccess: (data) => {
        setPreview(data);
        setStep("review");
      },
    });
  };

  /**
   * Type-safe chained flow:
   *   1. createBatch / resumeBatch  →  awaits and extracts the valid batchId
   *   2. runBatch OR scheduleBatch  →  waits, then closes the drawer on success
   */
  const handleConfirm = async () => {
    if (scheduleEnabled && (!scheduledAt || scheduleError)) return;

    try {
      let batchId: string;

      if (isResumeMode && resumeBatchId) {
        const data = (await resumeBatch.mutateAsync(
          resumeBatchId,
        )) as ResumeBatchResponse;
        batchId = data.newBatch.id;
      } else {
        if (!file) return;
        const data = await createBatch.mutateAsync({ file, retryConfig });
        batchId = data.batch.id;
      }

      // Step 2 — run or schedule
      if (scheduleEnabled && scheduledAt) {
        await scheduleBatch.mutateAsync({
          batchId,
          scheduledAt: toBolnaISO(scheduledAt),
        });
      } else {
        await runBatch.mutateAsync(batchId);
      }

      handleClose();
    } catch {
      // API error toasts are handled globally in individual mutate configurations.
    }
  };

  const handleClose = () => {
    if (isBusy) return;

    // Resetting states inside event handler is safe and prevents render cascades
    setStep("upload");
    setFile(null);
    setPreview(null);
    setRetryConfig(undefined);
    setScheduleEnabled(false);
    setScheduledAt(null);
    setScheduleError(null);
    setMinDateString("");

    onClose();
  };

  // ── pure derived view calculation ────────────────────────────────────
  const showReviewStep = isResumeMode || step === "review";

  // ── title / description ──────────────────────────────────────────────
  const title = isResumeMode
    ? "Resume Batch"
    : !showReviewStep
      ? "Upload Leads"
      : "Review & Configure";

  const description = isResumeMode
    ? "Create a new batch with remaining leads and choose how to launch it."
    : !showReviewStep
      ? "Import phone numbers from a CSV, XLS, or XLSX file."
      : "Verify parsed leads, configure retry behavior, and launch.";

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setScheduledAt(null);
      return;
    }
    const d = new Date(e.target.value);
    if (d.getTime() < Date.now() + 2 * 60 * 1000) {
      setScheduleError(
        "Schedule time must be at least 2 minutes in the future.",
      );
    } else {
      setScheduleError(null);
    }
    setScheduledAt(d);
  };

  const confirmDisabled =
    isBusy ||
    (scheduleEnabled && (!scheduledAt || !!scheduleError)) ||
    (!isResumeMode && (preview?.readyToImport ?? 0) === 0);

  const confirmLabel = scheduleEnabled ? "Schedule Batch" : "Run Now";

  // ── render ───────────────────────────────────────────────────────────
  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size="lg"
      disableBackdropClose={isBusy}
    >
      {/* ── Step 1: Upload (upload mode only) ─────────────────────────── */}
      {!showReviewStep && (
        <UploadStep
          onFileSelect={handleFileSelect}
          isParsing={parseCSV.isPending}
        />
      )}

      {/* ── Step 2: Review & Configure ────────────────────────────────── */}
      {showReviewStep && ((!isResumeMode && preview) || isResumeMode) && (
        <ReviewStep
          isResumeMode={isResumeMode}
          preview={preview}
          retryConfig={retryConfig}
          onRetryConfigChange={setRetryConfig}
          scheduleEnabled={scheduleEnabled}
          onScheduleToggle={(checked) => {
            setScheduleEnabled(checked);
            setScheduleError(null);
          }}
          minDateString={minDateString}
          onDateChange={handleDateChange}
          scheduleError={scheduleError}
          onCancel={handleClose}
          onConfirm={handleConfirm}
          isBusy={isBusy}
          confirmDisabled={confirmDisabled}
          confirmLabel={confirmLabel}
        />
      )}
    </Drawer>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Step 1 — File Upload
   ────────────────────────────────────────────────────────────────────────── */
function UploadStep({
  onFileSelect,
  isParsing,
}: {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isParsing: boolean;
}) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-surface-border p-10 transition hover:border-brand-400 hover:bg-brand-50/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Upload size={22} />
        </div>
        <span className="text-base font-semibold text-text-primary">
          Click to upload CSV, XLS, or XLSX
        </span>
        <span className="text-sm text-text-muted">
          Indian phone numbers only (+91)
        </span>
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={onFileSelect}
          disabled={isParsing}
        />
      </label>

      {isParsing && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Spinner />
          <span className="text-base text-text-muted">Parsing file…</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Step 2 — Review & Configure (shared by upload + resume modes)
   ────────────────────────────────────────────────────────────────────────── */
function ReviewStep({
  isResumeMode,
  preview,
  retryConfig,
  onRetryConfigChange,
  scheduleEnabled,
  onScheduleToggle,
  minDateString,
  onDateChange,
  scheduleError,
  onCancel,
  onConfirm,
  isBusy,
  confirmDisabled,
  confirmLabel,
}: {
  isResumeMode: boolean;
  preview: ParseLeadsResult | null;
  retryConfig: RetryConfig | undefined;
  onRetryConfigChange: (c: RetryConfig | undefined) => void;
  scheduleEnabled: boolean;
  onScheduleToggle: (checked: boolean) => void;
  minDateString: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scheduleError: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  isBusy: boolean;
  confirmDisabled: boolean;
  confirmLabel: string;
}) {
  return (
    <div className="space-y-5">
      {/* ── Resume info banner ────────────────────────────────────────── */}
      {isResumeMode && (
        <div className="flex items-start gap-3 rounded-lg bg-info-50 border border-info-100 p-4">
          <RotateCcw className="h-5 w-5 shrink-0 text-info-600 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-info-800">
              Resume Stopped Batch
            </h3>
            <p className="text-sm text-info-700 mt-1">
              A new batch will be created with the remaining leads from the
              stopped batch. Choose how to launch it below.
            </p>
          </div>
        </div>
      )}

      {/* ── Parsed-lead stats (upload mode only) ──────────────────────── */}
      {!isResumeMode && preview && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Total Rows" value={preview.total} />
            <StatTile
              label="Valid Indian"
              value={preview.valid}
              color="green"
            />
            <StatTile
              label="Non-Indian"
              value={preview.nonIndian}
              color="amber"
            />
            <StatTile label="Invalid" value={preview.invalid} color="red" />
          </div>

          {preview.inFileDuplicates > 0 && (
            <WarningLine
              text={`${preview.inFileDuplicates} duplicate(s) within file`}
            />
          )}
          {preview.dbDuplicates > 0 && (
            <WarningLine
              text={`${preview.dbDuplicates} duplicate(s) already in campaign`}
            />
          )}

          <div className="rounded-lg bg-success-50 p-4 text-center border border-success-100">
            <span className="text-3xl font-bold text-success-700">
              {preview.readyToImport}
            </span>
            <p className="text-sm text-success-600 font-medium mt-1">
              leads ready to import
            </p>
          </div>
        </>
      )}

      {/* ── Schedule checkbox (above retry config) ────────────────────── */}
      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-surface-border bg-surface hover:bg-surface-hover transition-colors">
        <input
          type="checkbox"
          checked={scheduleEnabled}
          onChange={(e) => onScheduleToggle(e.target.checked)}
          className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"
          disabled={isBusy}
        />
        <div className="flex-1">
          <span className="text-base font-semibold text-text-primary">
            Schedule for later
          </span>
          <p className="text-sm text-text-muted mt-0.5">
            Uncheck to run this batch immediately after creation.
          </p>
        </div>
      </label>

      {/* ── Datetime picker (visible when scheduling) ─────────────────── */}
      {scheduleEnabled && (
        <div className="space-y-2">
          <label className="text-base font-medium text-text-secondary">
            Trigger Date &amp; Time
          </label>
          <input
            type="datetime-local"
            className="w-full h-10 rounded-md border border-surface-border bg-surface px-3 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            min={minDateString}
            onChange={onDateChange}
            disabled={isBusy}
          />
          {scheduleError && (
            <p className="text-sm text-error-600">{scheduleError}</p>
          )}
        </div>
      )}

      {/* ── Retry config (upload mode only) ───────────────────────────── */}
      {!isResumeMode && (
        <RetryConfigEditor value={retryConfig} onChange={onRetryConfigChange} />
      )}

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isBusy}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          loading={isBusy}
          disabled={confirmDisabled}
          leftIcon={
            scheduleEnabled ? <CalendarClock size={16} /> : <Play size={16} />
          }
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Tiny presentational helpers
   ────────────────────────────────────────────────────────────────────────── */
function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "red" | "amber";
}) {
  const palette = {
    green: "text-success-700 bg-success-50 border-success-100",
    red: "text-error-700 bg-error-50 border-error-100",
    amber: "text-warning-700 bg-warning-50 border-warning-100",
  };
  return (
    <div
      className={`rounded-lg p-3 text-center border ${
        color ? palette[color] : "bg-surface-muted border-surface-border"
      }`}
    >
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm text-text-muted mt-0.5">{label}</div>
    </div>
  );
}

function WarningLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-warning-50 border border-warning-100 px-3 py-2 text-base text-warning-700">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
