// src/app/(dashboard)/campaigns/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAssistants } from "@/hooks/useAssistants";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useExtractBrochure, useSaveBrochure } from "@/hooks/useBrochure";
import { BrochureUploader } from "@/components/brochure/BrochureUploader";
import { BrochureReviewForm } from "@/components/brochure/BrochureReviewForm";
import { CampaignDetailsForm } from "@/components/campaigns/CampaignDetailsForm";
import { PageSpinner } from "@/components/ui/Spinner";
import type { FlattenedBrochure } from "@/types";

// ─── Step definitions ─────────────────────────────────────────────────────────
type Step =
  | "brochure-upload" // Step 1 — optional PDF upload
  | "brochure-review" // Step 2 — review extracted data
  | "campaign-details"; // Step 3 — name, assistant, create

const STEPS = [
  { key: "brochure-upload", label: "Property Brochure" },
  { key: "brochure-review", label: "Review Data" },
  { key: "campaign-details", label: "Campaign Details" },
] as const;

export default function NewCampaignPage() {
  const router = useRouter();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<Step>("brochure-upload");
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Extracted data state ────────────────────────────────────────────────────
  const [extractedData, setExtractedData] = useState<FlattenedBrochure | null>(
    null,
  );
  const [savedBrochureId, setSavedBrochureId] = useState<string | null>(null);

  // ── Hooks ───────────────────────────────────────────────────────────────────
  const { data: assistants, isLoading: assistantsLoading } = useAssistants();
  const { mutate: createCampaign, isPending: creating } = useCreateCampaign();
  const { mutate: extract, isPending: extracting } = useExtractBrochure();
  const { mutate: save, isPending: saving } = useSaveBrochure();

  if (assistantsLoading) return <PageSpinner />;

  // ── Step indicators ─────────────────────────────────────────────────────────
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // Step 1: User drops PDF
  const handleFileSelected = (file: File) => {
    setUploadProgress(0);

    extract(
      { file, onProgress: setUploadProgress },
      {
        onSuccess: (result) => {
          setExtractedData(result.flattenedForSave);
          setCurrentStep("brochure-review");
        },
      },
    );
  };

  // Step 1: User skips brochure
  const handleSkipBrochure = () => {
    setExtractedData(null);
    setSavedBrochureId(null);
    setCurrentStep("campaign-details");
  };

  // Step 2: User confirms/edits extracted data
  const handleBrochureConfirm = (editedData: FlattenedBrochure) => {
    save(editedData, {
      onSuccess: (result) => {
        setSavedBrochureId(result.brochureId);
        setCurrentStep("campaign-details");
      },
    });
  };

  // Step 2: User goes back to re-upload
  const handleBrochureBack = () => {
    setExtractedData(null);
    setCurrentStep("brochure-upload");
  };

  // Step 3: Create campaign
  const handleCreateCampaign = (data: {
    name: string;
    description?: string;
    assistantId: string;
  }) => {
    createCampaign(
      {
        ...data,
        brochureId: savedBrochureId ?? undefined,
      },
      {
        onSuccess: (campaign) => router.push(`/campaigns/${campaign.id}`),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-3 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Campaigns
        </Link>
        <h2 className="text-lg font-semibold text-text-primary">
          Create Campaign
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          Set up a new lead qualification campaign
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = index < stepIndex;
          const isCurrent = index === stepIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-surface-secondary text-text-muted border border-border",
                  ].join(" ")}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span
                  className={[
                    "text-sm font-medium",
                    isCurrent ? "text-text-primary" : "text-text-muted",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={[
                    "h-px w-8 mx-3",
                    isCompleted ? "bg-primary" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === "brochure-upload" && (
        <BrochureUploader
          isExtracting={extracting}
          uploadProgress={uploadProgress}
          onFileSelected={handleFileSelected}
          onSkip={handleSkipBrochure}
        />
      )}

      {currentStep === "brochure-review" && extractedData && (
        <BrochureReviewForm
          data={extractedData}
          isSaving={saving}
          onConfirm={handleBrochureConfirm}
          onBack={handleBrochureBack}
        />
      )}

      {currentStep === "campaign-details" && (
        <CampaignDetailsForm
          assistants={assistants ?? []}
          isCreating={creating}
          brochureName={extractedData?.projectName ?? null}
          hasBrochure={Boolean(savedBrochureId)}
          onSubmit={handleCreateCampaign}
          onBack={() =>
            setCurrentStep(
              extractedData ? "brochure-review" : "brochure-upload",
            )
          }
        />
      )}
    </div>
  );
}
