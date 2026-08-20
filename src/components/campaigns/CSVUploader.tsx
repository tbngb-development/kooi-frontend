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

function isValidExtension(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(ext);
}

export function CSVUploader({ campaignId }: CSVUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [allowDuplicates, setAllowDuplicates] = useState(false); // 👈 test flag

  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: upload, isPending } = useUploadCSV(campaignId);

  const validateFile = useCallback((file: File): string | null => {
    if (!isValidExtension(file.name)) {
      return "Only .csv, .xls, or .xlsx files are accepted";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be smaller than ${MAX_FILE_SIZE_MB} MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null);
      setSelectedFile(null);

      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      setSelectedFile(file);

      // 👈 pass allowDuplicates captured from state at call time
      upload(
        { file, allowDuplicates },
        {
          onSuccess: () => setSelectedFile(null),
          onError: (err: Error) => {
            setValidationError(
              err?.message ?? "Upload failed. Please try again.",
            );
          },
        },
      );
    },
    [validateFile, upload, allowDuplicates],
  );

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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
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
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        onChange={handleChange}
        className="hidden"
        aria-label="Upload lead file"
        disabled={isPending}
      />

      {/* Drop zone */}
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          isPending
            ? "border-surface-border bg-surface-subtle cursor-not-allowed opacity-60"
            : dragging
              ? "border-brand-500 bg-brand-50 cursor-copy"
              : "border-surface-border hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer",
        )}
      >
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
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

      {/* Validation error */}
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

      <label className="inline-flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={allowDuplicates}
          onChange={(e) => setAllowDuplicates(e.target.checked)}
          disabled={isPending}
          className="h-3.5 w-3.5 rounded border-surface-border accent-brand-600"
        />
        <span className="text-xs text-text-muted">
          Allow duplicate contacts
        </span>
      </label>

      {/* File indicator */}
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
          {!isPending ? (
            <button
              onClick={handleRemove}
              aria-label="Remove selected file"
              className="flex h-7 w-7 items-center justify-center rounded ml-2 text-text-muted hover:bg-surface-hover"
            >
              <X size={14} />
            </button>
          ) : (
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
