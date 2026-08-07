// src/app/(dashboard)/campaigns/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Check, ListChecks, Settings2 } from "lucide-react";
import { useAssistants, useAssistant } from "@/hooks/useAssistants";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { CampaignDetailsStep } from "@/components/campaigns/CampaignDetailsStep";
import { CampaignVariablesStep } from "@/components/campaigns/CampaignVariablesStep";
import { PageSpinner } from "@/components/ui/Spinner";

type Step = "details" | "variables";

const STEPS = [
  {
    key: "details",
    label: "Campaign Details",
    icon: ListChecks,
  },
  {
    key: "variables",
    label: "Configure Variables",
    icon: Settings2,
  },
] as const;

interface CampaignBasicDetails {
  name: string;
  description?: string;
  assistantId: string;
}

export default function NewCampaignPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>("details");

  const [basicDetails, setBasicDetails] = useState<CampaignBasicDetails | null>(
    null,
  );
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(
    null,
  );

  const { data: assistants, isLoading: assistantsLoading } = useAssistants();
  const {
    data: assistantDetail,
    isLoading: assistantLoading,
    isError: assistantError,
  } = useAssistant(selectedAssistantId);

  const { mutate: createCampaign, isPending: creating } = useCreateCampaign();

  if (assistantsLoading) return <PageSpinner />;

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const handleDetailsNext = (data: CampaignBasicDetails) => {
    setBasicDetails(data);
    setSelectedAssistantId(data.assistantId);
    setCurrentStep("variables");
  };

  const handleCreateCampaign = (variables: Record<string, string>) => {
    if (!basicDetails) return;

    createCampaign(
      {
        name: basicDetails.name,
        description: basicDetails.description,
        assistantId: basicDetails.assistantId,
        variables,
      },
      {
        onSuccess: (campaign) => router.push(`/campaigns/${campaign.id}`),
      },
    );
  };

  const handleBack = () => {
    setCurrentStep("details");
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
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const isCompleted = index < stepIndex;
          const isCurrent = index === stepIndex;
          const isLast = index === STEPS.length - 1;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Icon circle */}
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                    isCompleted
                      ? "bg-text-primary text-white"
                      : isCurrent
                        ? "bg-primary/10 text-primary ring-1 ring-border"
                        : "bg-surface-secondary text-text-muted ring-1 ring-border",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check size={14}  />
                  ) : (
                    <StepIcon size={14} />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col">
                  <span
                    className={[
                      "text-xs font-medium leading-none",
                      isCurrent || isCompleted
                        ? "text-text-primary"
                        : "text-text-muted",
                    ].join(" ")}
                  >
                    Step {index + 1}
                  </span>
                  <span
                    className={[
                      "text-sm font-semibold mt-1",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                          ? "text-text-primary"
                          : "text-text-muted",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={[
                      "h-0.5 rounded-full transition-colors",
                      isCompleted ? "bg-primary" : "bg-border",
                    ].join(" ")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === "details" && (
        <CampaignDetailsStep
          assistants={assistants ?? []}
          initialValues={basicDetails}
          onNext={handleDetailsNext}
        />
      )}

      {currentStep === "variables" && (
        <CampaignVariablesStep
          variables={assistantDetail?.variables ?? []}
          isLoadingVariables={assistantLoading}
          variablesError={assistantError}
          isCreating={creating}
          assistantName={
            assistants?.find((a) => a.id === basicDetails?.assistantId)?.name ??
            ""
          }
          onSubmit={handleCreateCampaign}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
