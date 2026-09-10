"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  FileText,
  Rocket,
} from "lucide-react";
import { useExtractBrochure } from "@/hooks/useBrochure";
import type { FlattenedBrochure } from "@/types/brochure";
import { FloatingBottomBar } from "./FloatingBottomBar";

// ── Removed lead_source from this list and hid them from UI completely ─────
const LEAD_AUTO_FIELDS = new Set(["customer_name", "customer_phone"]);

// ── Map brochure extracted fields → prompt variable keys ────────────────────
const BROCHURE_TO_VARIABLE_MAP: Record<string, keyof FlattenedBrochure> = {
  project_name: "projectName",
  builder_name: "developerName",
  project_location: "fullAddress",
  verified_starting_price: "startingPrice",
  verified_rera_information: "reraNumber",
  verified_possession_information: "possessionDate",
  available_configurations: "configurations",
  verified_amenities: "amenities",
  verified_project_highlights: "usps",
};

// ── Helper to extract string key from string or object ──────────────────────
function extractVariableKey(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    const candidate =
      obj.key ?? obj.name ?? obj.label ?? obj.variable ?? obj.id;
    if (typeof candidate === "string") return candidate;
  }
  return String(item ?? "");
}

// ── Convert snake_case / camelCase prompt keys to user-friendly titles ───────
function formatVariableLabel(key: unknown): string {
  const str = extractVariableKey(key);
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface CampaignVariablesStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any[];
  isLoadingVariables: boolean;
  variablesError: boolean;
  isCreating: boolean;
  assistantName: string;
  onSubmit: (variables: Record<string, string>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function CampaignVariablesStep({
  variables = [],
  isLoadingVariables,
  variablesError,
  isCreating,
  assistantName,
  onSubmit,
  onBack,
  onCancel,
}: CampaignVariablesStepProps) {
  // Filter out auto-injected fields immediately so they don't count or render
  const normalizedVariables = useMemo(() => {
    if (!Array.isArray(variables)) return [];
    return variables
      .map(extractVariableKey)
      .filter(Boolean)
      .filter((v) => !LEAD_AUTO_FIELDS.has(v));
  }, [variables]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [documentLinked, setDocumentLinked] = useState(false);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set());

  const { mutate: extractBrochure, isPending: extracting } =
    useExtractBrochure();

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setAutoFilledKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleDocumentUpload = (file: File) => {
    extractBrochure(
      { file, onProgress: () => {} },
      {
        onSuccess: (result) => {
          const brochure = result.flattenedForSave;
          const filled = new Set<string>();

          setValues((prev) => {
            const updated = { ...prev };

            for (const [varKey, brochureField] of Object.entries(
              BROCHURE_TO_VARIABLE_MAP,
            )) {
              if (!normalizedVariables.includes(varKey)) continue;
              if (updated[varKey]?.trim()) continue;

              const rawValue = brochure[brochureField];
              let stringValue = "";

              if (Array.isArray(rawValue)) {
                stringValue = rawValue.join(", ");
              } else if (rawValue !== null && rawValue !== undefined) {
                stringValue = String(rawValue);
              }

              if (stringValue) {
                updated[varKey] = stringValue;
                filled.add(varKey);
              }
            }
            return updated;
          });

          setAutoFilledKeys(filled);
          setDocumentLinked(true);
          setDocumentName(brochure.projectName ?? file.name);
        },
      },
    );
  };

  const handleRemoveDocument = () => {
    setValues((prev) => {
      const updated = { ...prev };
      autoFilledKeys.forEach((key) => {
        delete updated[key];
      });
      return updated;
    });
    setAutoFilledKeys(new Set());
    setDocumentLinked(false);
    setDocumentName(null);
  };

  const handleSubmit = () => {
    const filled: Record<string, string> = {};
    normalizedVariables.forEach((key) => {
      const val = values[key]?.trim();
      if (val) {
        filled[key] = val;
      }
    });
    onSubmit(filled);
  };

  const filledCount = normalizedVariables.filter(
    (v) => (values[v] ?? "").trim() !== "",
  ).length;
  const totalCount = normalizedVariables.length;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoadingVariables) {
    return (
      <Card className="border-surface-border bg-surface p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" className="text-brand-600" />
          <p className="text-base font-medium text-text-secondary">
            Resolving dynamic agent configurations...
          </p>
        </div>
      </Card>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (variablesError) {
    return (
      <Card className="border-surface-border bg-surface p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle size={28} className="text-error-500" />
          <p className="text-lg font-bold text-text-primary">
            Failed to parse assistant variables
          </p>
          <p className="text-sm text-text-muted">
            Please back out and verify the voice agent connection.
          </p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  // ── No variables state ──────────────────────────────────────────────────────
  if (normalizedVariables.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-surface-border bg-surface p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 size={32} className="text-success-600" />
            <p className="text-xl font-bold text-text-primary">
              Configuration Completed
            </p>
            <p className="text-base text-text-muted max-w-sm">
              This voice assistant does not hold any custom variable parameters.
              You are ready to launch!
            </p>
          </div>
        </Card>

        {/* ── Fixed Floating Bottom Bar ────────────────────────────────── */}
        <FloatingBottomBar
          onCancel={onCancel}
          leftAction={
            <Button
              variant="outline"
              leftIcon={<ChevronLeft size={16} />}
              onClick={onBack}
              disabled={isCreating}
            >
              Back
            </Button>
          }
          rightAction={
            <Button
              onClick={() => onSubmit({})}
              loading={isCreating}
              leftIcon={<Rocket size={16} />}
            >
              Create Campaign
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Card className="p-6 bg-surface shadow-sm">
        <h3 className="text-lg font-extrabold text-text-primary tracking-tight">
          Configure Prompt Variables
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Provide contextual details for{" "}
          <span className="font-bold text-brand-700">{assistantName}</span>
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(filledCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-text-secondary whitespace-nowrap">
            {filledCount} / {totalCount}
          </span>
        </div>
      </Card>

      {/* ── Document Upload Area ──────────────────────────────────────────── */}
      {documentLinked ? (
        <div className="flex items-center gap-3 rounded-2xl bg-success-50 border border-success-200/50 p-5 shadow-sm">
          <CheckCircle2 size={20} className="text-success-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-success-900 truncate">
              {documentName}
            </p>
            <p className="text-sm font-medium text-success-700 mt-0.5">
              {autoFilledKeys.size} variable
              {autoFilledKeys.size !== 1 ? "s" : ""} auto-filled from document
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveDocument}
            className="text-success-600 hover:text-error-600 transition-colors p-2 hover:bg-success-200/50 rounded-lg cursor-pointer"
            aria-label="Remove linked document"
          >
            <X size={18} />
          </button>
        </div>
      ) : extracting ? (
        <div className="flex items-center gap-4 rounded-2xl border border-surface-border bg-surface p-6 shadow-sm">
          <Spinner className="text-brand-600" />
          <p className="text-sm font-medium text-text-secondary">
            AI is analyzing document context to auto-fill fields...
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            document.getElementById("document-upload-input")?.click()
          }
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-surface-border hover:border-brand-400 hover:bg-brand-50/30 text-text-muted transition-all cursor-pointer group shadow-sm bg-surface"
        >
          <div className="h-12 w-12 rounded-full bg-surface-subtle group-hover:bg-brand-100 flex items-center justify-center transition-colors">
            <Upload
              size={22}
              className="text-text-placeholder group-hover:text-brand-600 transition-colors"
            />
          </div>
          <div className="text-center">
            <span className="block text-base font-bold text-text-primary group-hover:text-brand-700 transition-colors">
              Upload Context Document
            </span>
            <span className="block text-sm text-text-muted mt-1">
              Upload a PDF to let AI automatically read and fill matching
              fields.
            </span>
          </div>
          <input
            id="document-upload-input"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleDocumentUpload(file);
              e.target.value = "";
            }}
          />
        </button>
      )}

      {/* ── Floating Label Variable Inputs Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {normalizedVariables.map((variable) => {
          const isAutoFilled = autoFilledKeys.has(variable);
          const value = values[variable] ?? "";

          return (
            <div key={variable} className="relative group">
              <input
                id={`input-${variable}`}
                className="peer w-full h-14 rounded-xl border border-surface-border bg-surface px-4 pb-2 pt-6 text-base text-text-primary transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder-transparent shadow-sm"
                placeholder=" "
                value={value}
                onChange={(e) => updateValue(variable, e.target.value)}
              />
              <label
                htmlFor={`input-${variable}`}
                className="absolute left-4 top-[17px] text-base font-medium text-text-placeholder transition-all peer-placeholder-shown:top-[17px] peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand-600 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[10px] pointer-events-none uppercase tracking-wider"
              >
                {formatVariableLabel(variable)}
              </label>
              {isAutoFilled && <AutoFilledDot />}
            </div>
          );
        })}
      </div>


      {/* ── Fixed Floating Bottom Bar ──────────────────────────────────────── */}
      <FloatingBottomBar
        onCancel={onCancel}
        leftAction={
          <Button
            variant="outline"
            leftIcon={<ChevronLeft size={16} />}
            onClick={onBack}
            disabled={isCreating}
          >
            Back
          </Button>
        }
        rightAction={
          <Button
            onClick={handleSubmit}
            loading={isCreating}
            className="shadow-sm font-bold"
            leftIcon={<Rocket size={16} />}
          >
            Create Campaign
          </Button>
        }
      />
    </div>
  );
}

// ── Small auto-filled indicator dot ─────────────────────────────────────────
function AutoFilledDot() {
  return (
    <div
      className="absolute top-2 right-3 flex items-center gap-1 pointer-events-none"
      title="Auto-filled from document"
    >
      <Sparkles size={14} className="text-brand-500 fill-brand-100" />
    </div>
  );
}
