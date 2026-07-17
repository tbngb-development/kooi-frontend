// src/components/brochure/BrochureUploader.tsx

"use client";

import { useCallback, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import {
  Upload,
  FileText,
  SkipForward,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface BrochureUploaderProps {
  isExtracting: boolean;
  uploadProgress: number;
  onFileSelected: (file: File) => void;
  onSkip: () => void;
}

// Processing stages shown during the 30s AI wait
const EXTRACTION_STAGES = [
  { threshold: 0, label: "Uploading PDF..." },
  { threshold: 30, label: "Extracting text from PDF..." },
  { threshold: 60, label: "Running AI analysis..." },
  { threshold: 80, label: "Extracting property details..." },
  { threshold: 95, label: "Almost done..." },
] as const;

export function BrochureUploader({
  isExtracting,
  uploadProgress,
  onFileSelected,
  onSkip,
}: BrochureUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const currentStage =
    EXTRACTION_STAGES.filter((s) => uploadProgress >= s.threshold).pop()
      ?.label ?? EXTRACTION_STAGES[0].label;

  const validateAndSelect = useCallback(
    (file: File) => {
      setFileError(null);

      if (file.type !== "application/pdf") {
        setFileError("Only PDF files are accepted");
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setFileError("File size must be under 100MB");
        return;
      }

      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  // ── Extracting state ───────────────────────────────────────────────────────
  if (isExtracting && selectedFile) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-5 py-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText size={28} className="text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <Spinner size="sm" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">
              {currentStage}
            </p>
            <p className="text-xs text-text-muted mt-1">{selectedFile.name}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.max(uploadProgress, 5)}%` }}
              />
            </div>
            <p className="text-xs text-text-muted text-center mt-1.5">
              This may take up to 30 seconds
            </p>
          </div>

          {/* Stage steps */}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {EXTRACTION_STAGES.map((stage) => {
              const done = uploadProgress > stage.threshold;
              const active = currentStage === stage.label;
              return (
                <div key={stage.label} className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                  ) : active ? (
                    <Spinner size="sm" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span
                    className={[
                      "text-xs",
                      active
                        ? "text-text-primary font-medium"
                        : "text-text-muted",
                    ].join(" ")}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  // ── Upload state ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-col gap-1 mb-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Upload Property Brochure
          </h3>
          <p className="text-xs text-text-muted">
            {`Upload a PDF brochure and we'll automatically extract property
            details, pricing, and generate qualification questions for your
            AI agent. `}
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() =>
            document.getElementById("brochure-file-input")?.click()
          }
          className={[
            "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-surface-secondary/50",
          ].join(" ")}
        >
          <input
            id="brochure-file-input"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center">
              <Upload
                size={22}
                className={isDragging ? "text-primary" : "text-text-muted"}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {isDragging
                  ? "Drop your PDF here"
                  : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                PDF files only, up to 100MB
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {fileError && (
          <div className="flex items-center gap-2 mt-3 text-error">
            <AlertCircle size={14} />
            <p className="text-sm">{fileError}</p>
          </div>
        )}
      </Card>

      {/* Skip option */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-border text-sm text-text-muted hover:text-text-primary hover:border-text-muted transition-colors"
      >
        <SkipForward size={14} />
        Skip brochure — create campaign without property context
      </button>
    </div>
  );
}
