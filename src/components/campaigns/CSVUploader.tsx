// src/components/campaigns/CSVUploader.tsx

"use client";

import { useUploadCSV } from "@/hooks/useCampaigns";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, FileText, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface CSVUploaderProps {
  campaignId: string;
}

const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx"] as const;
const ACCEPTED_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");
const MAX_FILE_SIZE_MB = 10;

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function isValidExtension(filename: string): boolean {
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(
    getExtension(filename),
  );
}

export function CSVUploader({ campaignId }: CSVUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: upload, isPending } = useUploadCSV(campaignId);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateFile = useCallback((file: File): string | null => {
    if (!isValidExtension(file.name)) {
      return "Only .csv, .xls, or .xlsx files are accepted";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be smaller than ${MAX_FILE_SIZE_MB} MB`;
    }
    return null;
  }, []);

  // ── Auto-upload on valid file selection ───────────────────────────────────
  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null);
      setSelectedFile(null);

      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      // Show file immediately so user has visual feedback before upload fires
      setSelectedFile(file);

      upload(file, {
        onSuccess: () => {
          setSelectedFile(null);
        },
        onError: (err: Error) => {
          // Keep file shown so user can retry context is clear
          setValidationError(
            err?.message ?? "Upload failed. Please try again.",
          );
        },
      });
    },
    [validateFile, upload],
  );

  // ── Drag handlers ─────────────────────────────────────────────────────────
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
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so same file can be re-selected after error
      e.target.value = "";
    },
    [handleFile],
  );

  const handleZoneClick = useCallback(() => {
    if (isPending) return;
    inputRef.current?.click();
  }, [isPending]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        onChange={handleChange}
        className="hidden"
        aria-label="Upload lead file"
        disabled={isPending}
      />

      {/* Drop zone — disabled while uploading */}
      <div
        role="button"
        tabIndex={isPending ? -1 : 0}
        aria-label="Drop file here or click to browse"
        aria-disabled={isPending}
        onClick={handleZoneClick}
        onKeyDown={(e) => {
          if (isPending) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center",
          "transition-colors select-none",
          isPending
            ? "border-surface-border bg-surface-subtle cursor-not-allowed opacity-60"
            : dragging
              ? "border-brand-500 bg-brand-50 cursor-copy"
              : "border-surface-border hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        )}
      >
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              isPending
                ? "bg-brand-100"
                : dragging
                  ? "bg-brand-200"
                  : "bg-brand-100",
            )}
          >
            {isPending ? (
              <Loader2 size={20} className="text-brand-600 animate-spin" />
            ) : (
              <Upload
                size={20}
                className={cn(
                  "transition-colors",
                  dragging ? "text-brand-700" : "text-brand-600",
                )}
              />
            )}
          </div>

          <div>
            {isPending ? (
              <>
                <p className="text-sm font-medium text-text-primary">
                  Uploading leads…
                </p>
                <p className="text-xs text-text-muted mt-0.5">Please wait</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-text-primary">
                  {dragging ? "Release to upload" : "Drop your file here"}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  or{" "}
                  <span className="text-brand-600 hover:underline">
                    browse files
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Validation / upload error */}
      {validationError && (
        <div className="flex items-start gap-2 rounded-md bg-error-50 border border-error-100 p-3">
          <AlertCircle size={14} className="text-error-500 shrink-0 mt-0.5" />
          <p className="text-xs text-error-600">{validationError}</p>
        </div>
      )}

      {/* Format hint */}
      <div className="rounded-md bg-info-50 border border-info-100 p-3">
        <p className="text-xs font-medium text-info-600 mb-1.5">
          Accepted Formats
        </p>
        <p className="text-xs text-text-muted font-mono">
          .csv &nbsp;·&nbsp; .xls &nbsp;·&nbsp; .xlsx
        </p>
        <p className="text-xs text-text-muted mt-1.5 font-medium">
          Required columns
        </p>
        <p className="text-xs text-text-muted font-mono mt-0.5">name, phone</p>
        <p className="text-xs text-text-muted mt-0.5">
          Optional: email, company
        </p>
      </div>

      {/* Selected file indicator — shown while upload is in-flight */}
      {selectedFile && (
        <div className="flex items-center justify-between rounded-md border border-surface-border bg-surface-subtle p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={16} className="text-brand-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-text-muted">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {/* Only show remove if upload errored (isPending = false but file still shown) */}
          {!isPending && (
            <button
              onClick={handleRemove}
              aria-label="Remove selected file"
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded ml-2",
                "text-text-muted hover:bg-surface-hover",
              )}
            >
              <X size={14} />
            </button>
          )}

          {isPending && (
            <Loader2
              size={14}
              className="text-brand-600 animate-spin shrink-0 ml-2"
            />
          )}
        </div>
      )}
    </div>
  );
}
