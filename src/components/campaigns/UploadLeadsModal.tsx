import { useState } from "react";
import { Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useParseCSV } from "@/hooks/useCampaigns";
import { useCreateBatch } from "@/hooks/useBatches";
import { RetryConfigEditor } from "./RetryConfigEditor";
import type { ParseLeadsResult, RetryConfig } from "@/types";

interface UploadLeadsModalProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UploadLeadsModal({
  campaignId,
  isOpen,
  onClose,
}: UploadLeadsModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParseLeadsResult | null>(null);
  const [retryConfig, setRetryConfig] = useState<RetryConfig | undefined>();

  const parseCSV = useParseCSV(campaignId);
  const createBatch = useCreateBatch(campaignId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleConfirm = () => {
    if (!file) return;

    createBatch.mutate(
      { file, retryConfig },
      {
        onSuccess: () => setStep("done"),
      },
    );
  };

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setRetryConfig(undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Leads">
      {step === "upload" && (
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-surface-border p-8 transition hover:border-brand-400 hover:bg-brand-50/20">
            <Upload className="h-8 w-8 text-text-muted" />
            <span className="text-base font-medium text-text-primary">
              Click to upload CSV, XLS, or XLSX
            </span>
            <span className="text-sm text-text-muted">
              Indian phone numbers only (+91)
            </span>
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          {parseCSV.isPending && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Spinner />
              <span className="text-sm text-text-muted">Parsing file...</span>
            </div>
          )}
        </div>
      )}

      {step === "preview" && preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Rows" value={preview.total} />
            <StatCard
              label="Valid Indian"
              value={preview.valid}
              color="green"
            />
            <StatCard
              label="Non-Indian"
              value={preview.nonIndian}
              color="amber"
            />
            <StatCard label="Invalid" value={preview.invalid} color="red" />
          </div>

          {preview.inFileDuplicates > 0 && (
            <div className="flex items-center gap-2 rounded bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {preview.inFileDuplicates} duplicate(s) within file
            </div>
          )}

          {preview.dbDuplicates > 0 && (
            <div className="flex items-center gap-2 rounded bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {preview.dbDuplicates} duplicate(s) already in campaign
            </div>
          )}

          <div className="rounded-lg bg-success-50 p-4 text-center">
            <span className="text-2xl font-bold text-success-700">
              {preview.readyToImport}
            </span>
            <p className="text-sm text-success-600">leads ready to import</p>
          </div>

          <RetryConfigEditor value={retryConfig} onChange={setRetryConfig} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              loading={createBatch.isPending}
              disabled={preview.readyToImport === 0}
            >
              Import {preview.readyToImport} Leads
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <CheckCircle className="h-12 w-12 text-success-500" />
          <h3 className="text-lg font-semibold text-text-primary">
            Batch Created!
          </h3>
          <p className="text-sm text-text-muted">
            {`Your leads are ready. Use "Run Now" or "Schedule" to start calling.`}
          </p>
          <Button onClick={handleClose}>Done</Button>
        </div>
      )}
    </Modal>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "red" | "amber";
}) {
  const colorClasses = {
    green: "text-success-700 bg-success-50",
    red: "text-error-700 bg-error-50",
    amber: "text-warning-700 bg-warning-50",
  };

  return (
    <div
      className={`rounded-lg p-3 text-center ${color ? colorClasses[color] : "bg-surface-subtle"}`}
    >
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
