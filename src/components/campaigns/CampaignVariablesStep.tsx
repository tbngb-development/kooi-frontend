// src/components/campaigns/CampaignVariablesStep.tsx

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FloatingInput } from "@/components/ui/FloatingInput";
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
import type { PromptInputField, FlattenedBrochure } from "@/types";

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
  variables: PromptInputField[];
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

  // ── Initialize empty values when variables arrive ──────────────────────────
  useEffect(() => {
    if (variables.length > 0 && Object.keys(values).length === 0) {
      const initial: Record<string, string> = {};
      variables.forEach((v) => {
        initial[v.key] = "";
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues(initial);
    }
  }, [variables]);

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setAutoFilledKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  // ── Brochure upload → auto-fill matching fields ────────────────────────────
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
              if (!(varKey in updated)) continue;
              if (updated[varKey]) continue; // don't overwrite manual entries

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
        updated[key] = "";
      });
      return updated;
    });
    setAutoFilledKeys(new Set());
    setBrochureLinked(false);
    setBrochureName(null);
  };

  const handleSubmit = () => {
    const filled: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value.trim() !== "") {
        filled[key] = value.trim();
      }
    }
    onSubmit(filled);
  };

  const filledCount = Object.values(values).filter(
    (v) => v.trim() !== "",
  ).length;
  const totalCount = variables.length;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoadingVariables) {
    return (
      <Card>
        <div className="flex items-center justify-center gap-3 py-12">
          <Spinner size="sm" />
          <p className="text-sm text-text-muted">
            Loading agent configuration...
          </p>
        </div>
      </Card>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (variablesError) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-12">
          <AlertCircle size={24} className="text-error" />
          <p className="text-sm text-error">
            Failed to load agent variables. Please go back and try again.
          </p>
          <Button variant="outline" onClick={onBack}>
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
        <Card>
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 size={24} className="text-success" />
            <p className="text-sm font-medium text-text-primary">
              No configuration needed
            </p>
            <p className="text-xs text-text-muted">
              This agent does not require any campaign variables.
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
    <div className="flex flex-col gap-5">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Fill in your prompt variables
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Configuring{" "}
            <span className="font-medium text-text-primary">
              {assistantName}
            </span>
            {" — "}
            {filledCount}/{totalCount} filled
          </p>
        </div>
      </div>

      {/* ── Brochure Upload ───────────────────────────────────────────────── */}
      {brochureLinked ? (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-100 p-3">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 truncate">
              {brochureName}
            </p>
            <p className="text-xs text-green-600">
              {autoFilledKeys.size} field
              {autoFilledKeys.size !== 1 ? "s" : ""} auto-filled from brochure
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveBrochure}
            className="text-green-400 hover:text-error transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : extracting ? (
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Spinner size="sm" />
          <p className="text-sm text-text-primary">
            Extracting property data...
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            document.getElementById("brochure-upload-input")?.click()
          }
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-surface-secondary/30 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <Upload size={14} />
          Upload brochure PDF to auto-fill matching fields
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

      {/* ── Variable Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {variables.map((variable) => {
          const isLeadField = LEAD_AUTO_FIELDS.has(variable.key);
          const isAutoFilled = autoFilledKeys.has(variable.key);
          const value = values[variable.key] ?? "";

          // ── Lead-injected fields — read-only, greyed out ───────────────────
          if (isLeadField) {
            return (
              <div key={variable.key} className="relative">
                <div className="relative h-14 rounded-lg border border-dashed border-border bg-surface-secondary/40 flex items-center px-3.5">
                  <span className="text-sm text-text-muted">
                    {variable.key}
                  </span>
                  <span className="absolute -top-2 left-3 px-1 bg-surface text-[10px] font-medium text-text-muted uppercase tracking-wide">
                    From lead data
                  </span>
                </div>
              </div>
            );
          }

          // ── Standard input ────────────────────────────────────────────────
          return (
            <div key={variable.key} className="relative">
              <FloatingInput
                label={variable.key}
                value={value}
                onChange={(e) => updateValue(variable.key, e.target.value)}
              />
              {isAutoFilled && <AutoFilledDot />}
            </div>
          );
        })}
      </div>

      {/* ── Info footer ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 text-xs text-text-muted">
        <FileText size={12} className="mt-0.5 shrink-0" />
        <p>
          Empty fields will be handled gracefully by the agent using its
          fallback responses.
        </p>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSubmit} loading={isCreating}>
          Create Campaign
        </Button>
        <Button
          variant="outline"
          leftIcon={<ChevronLeft size={14} />}
          onClick={onBack}
          disabled={isCreating}
        >
          Back
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
      <Sparkles size={10} className="text-primary" />
    </div>
  );
}
