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
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

type Step = "details" | "variables";

const STEPS = [
  {
    key: "details",
    label: "Campaign Details",
    description: "Name and AI selection",
    icon: ListChecks,
  },
  {
    key: "variables",
    label: "Configure Variables",
    description: "Provide agent context",
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

  const handleBack = () => setCurrentStep("details");
  const handleCancel = () => router.push("/campaigns");

  return (
    <div className="max-w-6xl mx-auto px-2 pb-28">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary mb-3 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Campaigns
        </Link>
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
          Create New Campaign
        </h2>
        <p className="text-base text-text-muted mt-1">
          Set up a new AI-powered outreach pipeline in two simple steps.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Main Step Forms */}
        <div className="flex-1 min-w-0 w-full order-2 lg:order-1">
          {currentStep === "details" && (
            <CampaignDetailsStep
              assistants={assistants ?? []}
              initialValues={basicDetails}
              onNext={handleDetailsNext}
              onCancel={handleCancel}
            />
          )}

          {currentStep === "variables" && (
            <CampaignVariablesStep
              variables={assistantDetail?.variables ?? []}
              isLoadingVariables={assistantLoading}
              variablesError={assistantError}
              isCreating={creating}
              assistantName={
                assistants?.find((a) => a.id === basicDetails?.assistantId)
                  ?.name ?? ""
              }
              onSubmit={handleCreateCampaign}
              onBack={handleBack}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Right Side: Sticky Step Indicator */}
        <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 order-1 lg:order-2">
          <Card className="p-5 border-surface-border bg-surface shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder mb-5">
              Setup Progress
            </h3>
            <div className="flex flex-col">
              {STEPS.map((step, index) => {
                const isCompleted = index < stepIndex;
                const isCurrent = index === stepIndex;
                const isLast = index === STEPS.length - 1;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Icon & Line Column */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                          isCompleted
                            ? "bg-brand-600 text-white shadow-sm"
                            : isCurrent
                              ? "bg-brand-50 text-brand-600 ring-2 ring-brand-500/20"
                              : "bg-surface-subtle text-text-placeholder border border-surface-border",
                        )}
                      >
                        {isCompleted ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          <StepIcon size={16} />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "w-[2px] h-10 my-2 rounded-full transition-colors duration-300",
                            isCompleted ? "bg-brand-600" : "bg-surface-border",
                          )}
                        />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="pt-1.5 pb-8">
                      <p
                        className={cn(
                          "text-sm font-bold leading-none mb-1 transition-colors",
                          isCurrent
                            ? "text-brand-700"
                            : isCompleted
                              ? "text-text-primary"
                              : "text-text-muted",
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-text-placeholder">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
