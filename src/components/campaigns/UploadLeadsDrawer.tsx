"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Spinner } from "@/components/ui/Spinner";
import { RetryConfigEditor } from "@/components/campaigns/RetryConfigEditor";
import {
  useCreateBatch,
  useRunBatch,
  useScheduleBatch,
} from "@/hooks/useBatches";
import { useParseCSV } from "@/hooks/useCampaigns";
import { toBolnaISO, toDateTimeLocalString } from "@/lib/utils/date";
import type { RetryConfig } from "@/types/batch";
import type { ParseLeadsResult } from "@/types/campaign";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle,
  Play,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

interface UploadLeadsDrawerProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

type Step = "upload" | "preview" | "trigger";

/**
 * Multi-step lead upload drawer.
 * Step 1: File upload
 * Step 2: Preview + Retry config → Import
 * Step 3: On successful import → choose Run Now OR Schedule for later
 */
export function UploadLeadsDrawer({
  campaignId,
  isOpen,
  onClose,
}: UploadLeadsDrawerProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParseLeadsResult | null>(null);
  const [retryConfig, setRetryConfig] = useState<RetryConfig | undefined>();
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  const parseCSV = useParseCSV(campaignId);
  const createBatch = useCreateBatch(campaignId);
  const runBatch = useRunBatch(campaignId);
  const scheduleBatch = useScheduleBatch(campaignId);

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    parseCSV.mutate(selected, {
      onSuccess: (data) => {
        setPreview(data);
        setStep("preview");
      },
    });
  };

  const handleImport = () => {
    if (!file) return;
    createBatch.mutate(
      { file, retryConfig },
      {
        onSuccess: (data) => {
          setCreatedBatchId(data.batch.id);
          setStep("trigger");
        },
      },
    );
  };

  const handleClose = () => {
    // Reset state ONLY when not in the middle of an API call
    if (createBatch.isPending || runBatch.isPending || scheduleBatch.isPending)
      return;

    setStep("upload");
    setFile(null);
    setPreview(null);
    setRetryConfig(undefined);
    setCreatedBatchId(null);
    onClose();
  };

  // ─── Titles per step ──────────────────────────────────────────────────
  const stepMeta: Record<Step, { title: string; description: string }> = {
    upload: {
      title: "Upload Leads",
      description: "Import phone numbers from a CSV, XLS, or XLSX file.",
    },
    preview: {
      title: "Review & Configure",
      description: "Verify parsed leads and configure retry behavior.",
    },
    trigger: {
      title: "Batch Ready",
      description: "Choose how to launch your new batch.",
    },
  };

  const { title, description } = stepMeta[step];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size="lg"
      disableBackdropClose={
        createBatch.isPending || runBatch.isPending || scheduleBatch.isPending
      }
    >
      {step === "upload" && (
        <UploadStep
          onFileSelect={handleFileSelect}
          isParsing={parseCSV.isPending}
        />
      )}

      {step === "preview" && preview && (
        <PreviewStep
          preview={preview}
          retryConfig={retryConfig}
          onRetryConfigChange={setRetryConfig}
          onCancel={handleClose}
          onImport={handleImport}
          isImporting={createBatch.isPending}
        />
      )}

      {step === "trigger" && createdBatchId && (
        <TriggerStep
          batchId={createdBatchId}
          onRun={() =>
            runBatch.mutate(createdBatchId, { onSuccess: handleClose })
          }
          onSchedule={(date) =>
            scheduleBatch.mutate(
              { batchId: createdBatchId, scheduledAt: toBolnaISO(date) },
              { onSuccess: handleClose },
            )
          }
          onDone={handleClose}
          isRunning={runBatch.isPending}
          isScheduling={scheduleBatch.isPending}
        />
      )}
    </Drawer>
  );
}

// ─── Step 1: Upload ─────────────────────────────────────────────────────────
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
          <span className="text-sm text-text-muted">Parsing file...</span>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Preview ───────────────────────────────────────────────────────
function PreviewStep({
  preview,
  retryConfig,
  onRetryConfigChange,
  onCancel,
  onImport,
  isImporting,
}: {
  preview: ParseLeadsResult;
  retryConfig: RetryConfig | undefined;
  onRetryConfigChange: (c: RetryConfig | undefined) => void;
  onCancel: () => void;
  onImport: () => void;
  isImporting: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Parsed stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Rows" value={preview.total} />
        <StatTile label="Valid Indian" value={preview.valid} color="green" />
        <StatTile label="Non-Indian" value={preview.nonIndian} color="amber" />
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

      <RetryConfigEditor value={retryConfig} onChange={onRetryConfigChange} />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isImporting}>
          Cancel
        </Button>
        <Button
          onClick={onImport}
          loading={isImporting}
          disabled={preview.readyToImport === 0}
        >
          Import {preview.readyToImport} Leads
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Run or Schedule ───────────────────────────────────────────────
function TriggerStep({
  batchId,
  onRun,
  onSchedule,
  onDone,
  isRunning,
  isScheduling,
}: {
  batchId: string;
  onRun: () => void;
  onSchedule: (date: Date) => void;
  onDone: () => void;
  isRunning: boolean;
  isScheduling: boolean;
}) {
  const [mode, setMode] = useState<"run" | "schedule">("run");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const minDateString = useMemo(
    // eslint-disable-next-line react-hooks/purity
    () => toDateTimeLocalString(new Date(Date.now() + 3 * 60 * 1000)),
    [],
  );

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
      onRun();
    } else if (scheduledAt && !error) {
      onSchedule(scheduledAt);
    }
  };

  const isBusy = isRunning || isScheduling;

  return (
    <div className="space-y-5">
      {/* Success confirmation */}
      <div className="flex items-center gap-3 rounded-lg bg-success-50 border border-success-100 p-4">
        <CheckCircle className="h-6 w-6 shrink-0 text-success-600" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-success-800">
            Batch Pipeline Provisioned
          </h3>
          <p className="text-xs text-success-700 mt-0.5 font-mono truncate">
            ID: {batchId}
          </p>
        </div>
      </div>

      {/* Schedule toggle */}
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

      {/* Datetime input (when scheduling) */}
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

      {/* CTAs */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onDone} disabled={isBusy}>
          I&apos;ll Decide Later
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
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "red" | "amber";
}) {
  const colorClasses = {
    green: "text-success-700 bg-success-50 border-success-100",
    red: "text-error-700 bg-error-50 border-error-100",
    amber: "text-warning-700 bg-warning-50 border-warning-100",
  };
  return (
    <div
      className={`rounded-lg p-3 text-center border ${
        color ? colorClasses[color] : "bg-surface-muted border-surface-border"
      }`}
    >
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-text-muted mt-0.5">{label}</div>
    </div>
  );
}

function WarningLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded bg-warning-50 border border-warning-100 px-3 py-2 text-sm text-warning-700">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
