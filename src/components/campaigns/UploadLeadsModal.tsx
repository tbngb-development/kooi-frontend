// src/components/campaigns/UploadLeadsModal.tsx

"use client";

import { useState, useCallback, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useParseCSV, useUploadCSV } from "@/hooks/useCampaigns";
import { cn } from "@/lib/utils/cn";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  Users,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ParseLeadsResult } from "@/types";

interface UploadLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

type Step = "select" | "preview";

const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx"] as const;
const ACCEPTED_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");
const MAX_FILE_SIZE_MB = 10;

function isValidExtension(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(ext);
}

export function UploadLeadsModal({
  isOpen,
  onClose,
  campaignId,
}: UploadLeadsModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseLeadsResult | null>(null);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [showDuplicateList, setShowDuplicateList] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: parse, isPending: parsing } = useParseCSV(campaignId);
  const { mutate: upload, isPending: uploading } = useUploadCSV(campaignId);

  // ─── Reset all state when modal closes ────────────────────────────────────
  const handleClose = useCallback(() => {
    setStep("select");
    setFile(null);
    setDragging(false);
    setValidationError(null);
    setParseResult(null);
    setAllowDuplicates(false);
    setShowDuplicateList(false);
    onClose();
  }, [onClose]);

  // ─── File validation before parsing ───────────────────────────────────────
  const validateFile = useCallback((f: File): string | null => {
    if (!isValidExtension(f.name)) {
      return "Only .csv, .xls, or .xlsx files are accepted";
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be smaller than ${MAX_FILE_SIZE_MB} MB`;
    }
    return null;
  }, []);

  // ─── Handle new file — validate then parse ────────────────────────────────
  const handleFile = useCallback(
    (f: File) => {
      setValidationError(null);
      setParseResult(null);

      const error = validateFile(f);
      if (error) {
        setValidationError(error);
        return;
      }

      setFile(f);
      parse(f, {
        onSuccess: (result) => {
          setParseResult(result);
          setStep("preview");
        },
        onError: () => {
          setFile(null);
        },
      });
    },
    [validateFile, parse],
  );

  // ─── Drag handlers ────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleZoneClick = useCallback(() => {
    if (parsing) return;
    inputRef.current?.click();
  }, [parsing]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files?.[0];
      if (picked) handleFile(picked);
      e.target.value = "";
    },
    [handleFile],
  );

  // ─── Final confirmation — upload for real ─────────────────────────────────
  const handleConfirmUpload = useCallback(() => {
    if (!file) return;
    upload(
      { file, allowDuplicates },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  }, [file, allowDuplicates, upload, handleClose]);

  // ─── Go back to file picker step ──────────────────────────────────────────
  const handleGoBack = useCallback(() => {
    setStep("select");
    setFile(null);
    setParseResult(null);
    setValidationError(null);
    setShowDuplicateList(false);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "select" ? "Upload Leads" : "Review Upload"}
      size="lg"
    >
      {/* ═══════ STEP 1: FILE SELECT ═══════ */}
      {step === "select" && (
        <div className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={parsing}
          />

          <div
            role="button"
            tabIndex={parsing ? -1 : 0}
            onClick={handleZoneClick}
            onKeyDown={(e) => {
              if (parsing) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-10 text-center transition-colors select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              parsing
                ? "border-surface-border bg-surface-subtle cursor-not-allowed opacity-60"
                : dragging
                  ? "border-brand-500 bg-brand-50 cursor-copy"
                  : "border-surface-border hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer",
            )}
          >
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                {parsing ? (
                  <Loader2 size={22} className="text-brand-600 animate-spin" />
                ) : (
                  <Upload size={22} className="text-brand-600" />
                )}
              </div>
              <div>
                {parsing ? (
                  <>
                    <p className="text-base font-medium text-text-primary">
                      Parsing file…
                    </p>
                    <p className="text-sm text-text-muted mt-0.5">
                      Checking for duplicates and validating rows
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-medium text-text-primary">
                      {dragging
                        ? "Release to upload"
                        : "Drop your file here or click to browse"}
                    </p>
                    <p className="text-sm text-text-muted mt-0.5">
                      .csv · .xls · .xlsx (max {MAX_FILE_SIZE_MB} MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {validationError && (
            <div className="flex items-start gap-2 rounded-md bg-error-50 border border-error-100 p-3">
              <AlertCircle
                size={14}
                className="text-error-500 shrink-0 mt-0.5"
              />
              <p className="text-sm text-error-600">{validationError}</p>
            </div>
          )}

          <div className="rounded-md bg-info-50 border border-info-100 p-3">
            <p className="text-sm font-medium text-info-600 mb-1.5">
              Required columns
            </p>
            <p className="text-sm text-text-muted font-mono">phone</p>
            <p className="text-sm text-text-muted mt-1.5 font-medium">
              Optional columns
            </p>
            <p className="text-sm text-text-muted font-mono">
              name (min 3 chars), email, company
            </p>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2: PREVIEW STATS ═══════ */}
      {step === "preview" && parseResult && file && (
        <div className="flex flex-col gap-5">
          {/* File info */}
          <div className="flex items-center justify-between rounded-md border border-surface-border bg-surface-subtle p-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={16} className="text-brand-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-base font-medium text-text-primary truncate">
                  {file.name}
                </p>
                <p className="text-sm text-text-muted">
                  {(file.size / 1024).toFixed(1)} KB · {parseResult.total} rows
                </p>
              </div>
            </div>
          </div>

          {/* ── Stats Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Total Rows"
              value={parseResult.total}
              tone="neutral"
            />
            <StatBox
              label="Ready to Import"
              value={parseResult.readyToImport}
              tone="success"
            />
            <StatBox
              label="Duplicates"
              value={parseResult.inFileDuplicates + parseResult.dbDuplicates}
              tone="warning"
            />
            <StatBox
              label="Invalid"
              value={parseResult.invalid}
              tone={parseResult.invalid > 0 ? "error" : "neutral"}
            />
          </div>

          {/* ── Ready to Import Summary ───────────────────────────────── */}
          {parseResult.readyToImport > 0 && (
            <div className="flex items-start gap-2.5 rounded-md bg-success-50 border border-success-100 p-3">
              <Users size={14} className="text-success-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-success-700">
                  {parseResult.readyToImport} new lead
                  {parseResult.readyToImport !== 1 ? "s" : ""} will be added to
                  this campaign
                </p>
                <p className="text-[11px] text-success-600 mt-0.5">
                  These are unique phone numbers not already present.
                </p>
              </div>
            </div>
          )}

          {/* ── Invalid Rows Warning ───────────────────────────────────── */}
          {parseResult.invalid > 0 && (
            <div className="flex items-start gap-2.5 rounded-md bg-warning-50 border border-warning-100 p-3">
              <AlertCircle
                size={14}
                className="text-warning-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-warning-700">
                <span className="font-semibold">{parseResult.invalid}</span> row
                {parseResult.invalid !== 1 ? "s" : ""} will be skipped — missing
                phone number.
              </p>
            </div>
          )}

          {/* ── Duplicate Numbers ──────────────────────────────────────── */}
          {parseResult.inFileDuplicates + parseResult.dbDuplicates > 0 && (
            <div className="rounded-md bg-warning-50 border border-warning-100 p-3">
              <button
                type="button"
                onClick={() => setShowDuplicateList((v) => !v)}
                className="flex items-start justify-between w-full text-left cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    size={14}
                    className="text-warning-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-warning-700">
                      {parseResult.inFileDuplicates + parseResult.dbDuplicates}{" "}
                      duplicate number
                      {parseResult.inFileDuplicates +
                        parseResult.dbDuplicates !==
                      1
                        ? "s"
                        : ""}{" "}
                      detected
                    </p>
                    <p className="text-[11px] text-warning-600 mt-0.5">
                      {parseResult.inFileDuplicates > 0 && (
                        <>
                          {parseResult.inFileDuplicates} within your file
                          {parseResult.dbDuplicates > 0 && ", "}
                        </>
                      )}
                      {parseResult.dbDuplicates > 0 && (
                        <>
                          {parseResult.dbDuplicates} already exist in this
                          campaign
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {showDuplicateList ? (
                  <ChevronUp size={14} className="text-warning-600 shrink-0" />
                ) : (
                  <ChevronDown
                    size={14}
                    className="text-warning-600 shrink-0"
                  />
                )}
              </button>

              {showDuplicateList && (
                <div className="mt-2.5 pt-2.5 border-t border-warning-200 max-h-32 overflow-y-auto">
                  <p className="text-[11px] font-mono text-warning-800 break-words">
                    {[
                      ...parseResult.inFileDuplicateNumbers,
                      ...parseResult.dbDuplicateNumbers,
                    ].join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Dev-only: allow duplicates toggle ─────────────────────── */}
          <label className="inline-flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              disabled={uploading}
              className="h-3.5 w-3.5 rounded border-surface-border accent-brand-600"
            />
            <span className="text-sm text-text-muted">
              Allow duplicate contacts (Dev)
            </span>
          </label>

          {/* ── Actions ────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-2.5 pt-1">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft size={13} />}
              onClick={handleGoBack}
              disabled={uploading}
            >
              Choose Different File
            </Button>
            <Button
              onClick={handleConfirmUpload}
              loading={uploading}
              disabled={!allowDuplicates && parseResult.readyToImport === 0}
              leftIcon={<Upload size={13} />}
            >
              {allowDuplicates
                ? `Upload ${parseResult.valid} Lead${parseResult.valid !== 1 ? "s" : ""}`
                : `Import ${parseResult.readyToImport} Lead${parseResult.readyToImport !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Small Stat Box ─────────────────────────────────────────────────────────

function StatBox({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "warning" | "error";
  icon?: React.ReactNode;
}) {
  const toneClasses = {
    neutral: "bg-surface-subtle border-surface-border text-text-primary",
    success: "bg-success-50 border-success-100 text-success-700",
    warning: "bg-warning-50 border-warning-100 text-warning-700",
    error: "bg-error-50 border-error-100 text-error-700",
  };

  return (
    <div className={cn("rounded-lg border p-3", toneClasses[tone])}>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
