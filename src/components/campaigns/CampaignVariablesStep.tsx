"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import {
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  FileText,
} from "lucide-react";
import { useExtractBrochure } from "@/hooks/useBrochure";
import type { FlattenedBrochure } from "@/types";

// ── Fields auto-injected from lead data — shown as read-only in the grid ────
const LEAD_AUTO_FIELDS = new Set([
  "customer_name",
  "customer_phone",
  "lead_source",
]);

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

interface CampaignVariablesStepProps {
  variables: string[]; // V1: dynamic array of strings
  isLoadingVariables: boolean;
  variablesError: boolean;
  isCreating: boolean;
  assistantName: string;
  onSubmit: (variables: Record<string, string>) => void;
  onBack: () => void;
}

export function CampaignVariablesStep({
  variables,
  isLoadingVariables,
  variablesError,
  isCreating,
  assistantName,
  onSubmit,
  onBack,
}: CampaignVariablesStepProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [brochureLinked, setBrochureLinked] = useState(false);
  const [brochureName, setBrochureName] = useState<string | null>(null);
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

  // ── Convert snake_case prompt keys to user-friendly titles ─────────────────
  const formatVariableLabel = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ── Brochure upload → AI auto-fill matching prompt variables ───────────────
  const handleBrochureUpload = (file: File) => {
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
              if (!variables.includes(varKey)) continue;
              if (updated[varKey]?.trim()) continue; // Don't overwrite existing manual entries

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
          setBrochureLinked(true);
          setBrochureName(brochure.projectName ?? file.name);
        },
      },
    );
  };

  const handleRemoveBrochure = () => {
    setValues((prev) => {
      const updated = { ...prev };
      autoFilledKeys.forEach((key) => {
        delete updated[key];
      });
      return updated;
    });
    setAutoFilledKeys(new Set());
    setBrochureLinked(false);
    setBrochureName(null);
  };

  const handleSubmit = () => {
    const filled: Record<string, string> = {};
    variables.forEach((key) => {
      const val = values[key]?.trim();
      if (val) {
        filled[key] = val;
      }
    });
    onSubmit(filled);
  };

  const filledCount = variables.filter(
    (v) => (values[v] ?? "").trim() !== "",
  ).length;
  const totalCount = variables.length;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoadingVariables) {
    return (
      <Card className="border-surface-border bg-surface p-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <Spinner size="sm" />
          <p className="text-basebese text-text-muted">
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
          <AlertCircle size={24} className="text-error-500" />
          <p className="text-basebese font-semibold text-text-primary">
            Failed to parse assistant variables
          </p>
          <p className="text-xs text-text-muted">
            Please back out and verify the voice agent connection.
          </p>
          <Button variant="outline" size="sm" onClick={onBack} className="mt-2">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  // ── No variables state ──────────────────────────────────────────────────────
  if (variables.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <Card className="border-surface-border bg-surface p-8">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <CheckCircle2 size={24} className="text-success-600" />
            <p className="text-base font-bold text-text-primary">
              Configuration Completed
            </p>
            <p className="text-xs text-text-muted max-w-sm">
              This voice assistant does not hold any custom variable parameters.
              You are ready to launch!
            </p>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={() => onSubmit({})} loading={isCreating}>
            Create Campaign
          </Button>
          <Button
            variant="outline"
            leftIcon={<ChevronLeft size={14} />}
            onClick={onBack}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Configure Prompt Variables
        </h3>
        <p className="text-xs text-text-muted mt-1 leading-normal">
          Provide contextual details for{" "}
          <span className="font-semibold text-brand-600">{assistantName}</span>{" "}
          · {filledCount} of {totalCount} defined
        </p>
      </div>

      {/* ── Brochure Upload Area ──────────────────────────────────────────── */}
      {brochureLinked ? (
        <div className="flex items-center gap-3 rounded-lg bg-success-50 border border-success-100 p-3.5">
          <CheckCircle2 size={16} className="text-success-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-success-800 truncate">
              {brochureName}
            </p>
            <p className="text-xs text-success-600 mt-0.5">
              {autoFilledKeys.size} variable
              {autoFilledKeys.size !== 1 ? "s" : ""} auto-filled from brochure
              properties
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveBrochure}
            className="text-success-400 hover:text-error-600 transition-colors p-1 hover:bg-success-100 rounded-md"
            aria-label="Remove linked brochure"
          >
            <X size={15} />
          </button>
        </div>
      ) : extracting ? (
        <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-subtle p-3.5">
          <Spinner size="sm" />
          <p className="text-xs text-text-muted">
            AI extracting architectural metadata configurations...
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            document.getElementById("brochure-upload-input")?.click()
          }
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed border-surface-border hover:border-brand-400 hover:bg-brand-50/10 text-xs text-text-muted hover:text-brand-600 transition-all cursor-pointer group"
        >
          <Upload
            size={20}
            className="text-text-placeholder group-hover:text-brand-500 transition-colors"
          />
          <span className="font-medium text-text-secondary group-hover:text-brand-700">
            Upload PDF Brochure to auto-fill variables
          </span>
          <span className="text-[10px] text-text-placeholder">
            Kooi AI will read details and fill matching pricing, configurations
            and builders.
          </span>
          <input
            id="brochure-upload-input"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBrochureUpload(file);
              e.target.value = "";
            }}
          />
        </button>
      )}

      {/* ── Variable Inputs Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variables.map((variable) => {
          const isLeadField = LEAD_AUTO_FIELDS.has(variable);
          const isAutoFilled = autoFilledKeys.has(variable);
          const value = values[variable] ?? "";

          // ── Lead-injected variables — read-only tags ───────────────────────
          if (isLeadField) {
            return (
              <div key={variable} className="relative group">
                <div className="h-[52px] rounded-lg border border-dashed border-surface-border bg-surface-subtle/50 flex items-center px-3.5">
                  <span className="text-basebese font-mono text-text-muted">
                    {variable}
                  </span>
                  <span className="absolute -top-2 left-3 px-1.5 bg-surface text-[10px] font-bold text-text-placeholder uppercase tracking-wider">
                    Auto injected on call
                  </span>
                </div>
              </div>
            );
          }

          // ── Standard Input Field ──────────────────────────────────────────
          return (
            <div key={variable} className="relative">
              <Input
                label={formatVariableLabel(variable)}
                placeholder={`Value for ${formatVariableLabel(variable).toLowerCase()}...`}
                value={value}
                onChange={(e) => updateValue(variable, e.target.value)}
                hint={`Prompt key: ${variable}`}
                className="bg-surface border-surface-border"
              />
              {isAutoFilled && <AutoFilledDot />}
            </div>
          );
        })}
      </div>

      {/* ── Footer Info Helper ────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 text-xs text-text-muted bg-surface-subtle border border-surface-border p-3.5 rounded-lg">
        <FileText size={14} className="mt-0.5 shrink-0 text-text-placeholder" />
        <p className="leading-relaxed">
          <strong>Pro-tip:</strong> Empty fields will be handled gracefully by
          your agent using smart context-appropriate fallback vocabulary.
        </p>
      </div>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          loading={isCreating}
          className="shadow-sm font-semibold"
        >
          Create Campaign
        </Button>
      </div>
    </div>
  );
}

// ── Small auto-filled indicator dot ─────────────────────────────────────────
function AutoFilledDot() {
  return (
    <div
      className="absolute top-2 right-2 flex items-center gap-1 pointer-events-none"
      title="Auto-filled from brochure"
    >
      <Sparkles size={12} className="text-brand-500 fill-brand-100" />
    </div>
  );
}
