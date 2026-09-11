"use client";

import { useState } from "react";
import {
  Plus,
  Check,
  Archive,
  History,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import {
  useCreatePlanVersion,
  usePublishPlanVersion,
  useArchivePlanVersion,
} from "@/hooks/admin/useAdminPlans";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import NumberInput from "@/components/ui/NumberInput";
import { paisaToInr } from "@/lib/utils/formatMoney";
import type { PlanWithVersions, PlanVersion } from "@/types/plan";

interface PlanVersionManagerProps {
  plan: PlanWithVersions;
  onRefresh: () => void;
}

export function PlanVersionManager({
  plan,
  onRefresh,
}: PlanVersionManagerProps) {
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  // Custom confirmation modal states (replacing window.confirm)
  const [publishTarget, setPublishTarget] = useState<PlanVersion | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<PlanVersion | null>(null);

  // Form Fields (stored in Paisa)
  const [perMinuteRate, setPerMinuteRate] = useState(1000); // Default ₹10.00
  const [onboardingFee, setOnboardingFee] = useState(1999900); // Default ₹19,999.00
  const [includedBalance, setIncludedBalance] = useState(200000); // Default ₹2,000.00

  const { mutate: createVersion, isPending: isCreating } =
    useCreatePlanVersion();
  const { mutate: publishVersion, isPending: isPublishing } =
    usePublishPlanVersion();
  const { mutate: archiveVersion, isPending: isArchiving } =
    useArchivePlanVersion();

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    createVersion(
      {
        planId: plan.id,
        data: {
          perMinuteRate,
          onboardingFee,
          includedBalance,
          billingMinimumSec: 30,
          billingIncrementSec: 15,
        },
      },
      {
        onSuccess: () => {
          setIsCreatingDraft(false);
          onRefresh();
        },
      },
    );
  };

  const executePublish = () => {
    if (!publishTarget) return;
    publishVersion(publishTarget.id, {
      onSuccess: () => {
        setPublishTarget(null);
        onRefresh();
      },
    });
  };

  const executeArchive = () => {
    if (!archiveTarget) return;
    archiveVersion(archiveTarget.id, {
      onSuccess: () => {
        setArchiveTarget(null);
        onRefresh();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Action */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xs font-bold text-text-muted flex items-center gap-1.5 uppercase tracking-wider">
          <History size={16} className="text-brand-600" /> Catalog Release
          Timeline
        </h3>
        {!isCreatingDraft && (
          <Button
            size="sm"
            onClick={() => setIsCreatingDraft(true)}
            leftIcon={<Plus size={14} />}
          >
            Create Draft Version
          </Button>
        )}
      </div>

      {/* Draft Version Form */}
      {isCreatingDraft && (
        <Card className="p-5 border border-brand-200 bg-brand-25/50 animate-scale-in">
          <form onSubmit={handleCreateDraft} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
              <Sparkles size={14} className="animate-pulse-soft" />
              Draft New Commercial Terms
            </h4>

            <div className="space-y-4">
              {/* Onboarding Fee */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Onboarding Fee (Paisa)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <NumberInput
                    value={onboardingFee}
                    onChange={(val) =>
                      setOnboardingFee(val === "" ? 0 : Number(val))
                    }
                    step="10000"
                    min={0}
                  />
                  <span className="text-base font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100 font-mono">
                    {paisaToInr(onboardingFee)}
                  </span>
                </div>
              </div>

              {/* Voice Calling Rate */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Per Minute Voice Calling Rate (Paisa)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <NumberInput
                    value={perMinuteRate}
                    onChange={(val) =>
                      setPerMinuteRate(val === "" ? 0 : Number(val))
                    }
                    step="50"
                    min={0}
                  />
                  <span className="text-base font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100 font-mono">
                    {paisaToInr(perMinuteRate)}/min
                  </span>
                </div>
              </div>

              {/* Wallet Credits */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Included Wallet Balance (Paisa)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <NumberInput
                    value={includedBalance}
                    onChange={(val) =>
                      setIncludedBalance(val === "" ? 0 : Number(val))
                    }
                    step="10000"
                    min={0}
                  />
                  <span className="text-base font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100 font-mono">
                    {paisaToInr(includedBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsCreatingDraft(false)}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={isCreating}>
                Save Draft Version
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Version History List */}
      <div className="space-y-3">
        {plan.versions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-surface-border rounded-xl">
            <AlertCircle
              size={28}
              className="mx-auto text-text-placeholder mb-2"
            />
            <p className="text-base text-text-muted font-medium">
              No versions recorded for this plan package yet.
            </p>
          </div>
        ) : (
          plan.versions.map((ver: PlanVersion) => (
            <Card
              key={ver.id}
              className="p-4 border border-surface-border hover:border-neutral-300 transition-colors shadow-xs"
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-text-primary font-mono">
                    Version v{ver.version}
                  </span>
                  <Badge
                    variant={
                      ver.status === "PUBLISHED"
                        ? "success"
                        : ver.status === "DRAFT"
                          ? "blue"
                          : "gray"
                    }
                  >
                    {ver.status}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {ver.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => setPublishTarget(ver)}
                      disabled={isPublishing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-text-inverse transition-all cursor-pointer border border-brand-200"
                    >
                      <Check size={14} strokeWidth={2.5} /> Publish v
                      {ver.version}
                    </button>
                  )}
                  {ver.status === "PUBLISHED" && (
                    <button
                      type="button"
                      onClick={() => setArchiveTarget(ver)}
                      disabled={isArchiving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-surface-subtle text-text-muted hover:bg-error-50 hover:text-error-600 border border-surface-border hover:border-error-200 transition-all cursor-pointer"
                    >
                      <Archive size={14} /> Archive
                    </button>
                  )}
                </div>
              </div>

              {/* Commercial Terms Summary */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-surface-subtle text-xs text-text-secondary">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted font-bold uppercase tracking-wider text-[10px]">
                    Onboarding
                  </span>
                  <span className="font-mono text-base font-bold text-text-primary mt-0.5">
                    {paisaToInr(ver.onboardingFee)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted font-bold uppercase tracking-wider text-[10px]">
                    Minute Rate
                  </span>
                  <span className="font-mono text-base font-bold text-brand-700 mt-0.5">
                    {paisaToInr(ver.perMinuteRate)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted font-bold uppercase tracking-wider text-[10px]">
                    Included Pool
                  </span>
                  <span className="font-mono text-base font-bold text-text-primary mt-0.5">
                    {paisaToInr(ver.includedBalance)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Confirm Modal: Publish Release */}
      <ConfirmModal
        isOpen={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        onConfirm={executePublish}
        title={`Publish Version v${publishTarget?.version ?? ""}`}
        description="Are you sure you want to publish this version? Publishing will automatically archive any currently active version and set these commercial terms for new subscriptions."
        confirmLabel="Publish Release"
        variant="primary"
        loading={isPublishing}
      />

      {/* Confirm Modal: Archive Release */}
      <ConfirmModal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={executeArchive}
        title={`Archive Version v${archiveTarget?.version ?? ""}`}
        description="Are you sure you want to archive this version? Archived commercial versions can no longer be assigned to active workspaces."
        confirmLabel="Archive Version"
        variant="danger"
        loading={isArchiving}
      />
    </div>
  );
}
