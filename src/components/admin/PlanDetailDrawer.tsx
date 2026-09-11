"use client";

import {
  Sparkles,
  IndianRupee,
  PhoneCall,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { paisaToInr } from "@/lib/utils/formatMoney";
import type { Plan } from "@/types/plan";

interface PlanDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

function formatEnumText(val: string | null | undefined): string {
  if (!val) return "—";
  return val
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlanDetailDrawer({
  isOpen,
  onClose,
  plan,
}: PlanDetailDrawerProps) {
  if (!plan) return null;

  const v = plan.currentVersion;
  const hasMSRP =
    v?.onboardingFeeOriginal !== null &&
    v?.onboardingFeeOriginal !== undefined &&
    v.onboardingFeeOriginal > (v.onboardingFee ?? 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${plan.name} Specifications`}
      description={`System ID: ${plan.slug}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Section: Plan Header Status Overview */}
        <Card className="p-4 bg-surface-subtle border-surface-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Pricing Model
            </span>
            {v ? (
              <Badge
                variant={
                  v.pricingModel === "CUSTOM"
                    ? "purple"
                    : v.pricingModel === "VOLUME"
                      ? "blue"
                      : "gray"
                }
              >
                {v.pricingModel} Model
              </Badge>
            ) : (
              <span className="text-sm text-text-placeholder italic">
                No published version
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge
              variant={plan.isActive ? "success" : "gray"}
              dot={plan.isActive}
            >
              {plan.isActive ? "Active Plan" : "Inactive"}
            </Badge>
            <span className="text-xs font-semibold text-text-muted">
              Display Index #{plan.displayOrder}
            </span>
          </div>
        </Card>

        {v ? (
          <>
            {/* Section: Monetary & Rate Tiers */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <IndianRupee size={14} className="text-brand-600" />
                Monetary & Commercial Tiers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Onboarding Fee
                  </span>
                  <p className="text-base font-bold font-mono text-text-primary">
                    {paisaToInr(v.onboardingFee)}
                  </p>
                  {hasMSRP && (
                    <p className="text-xs text-text-placeholder font-mono line-through">
                      MSRP: {paisaToInr(v.onboardingFeeOriginal!)}
                    </p>
                  )}
                </Card>

                <Card className="p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Per Minute Calling Rate
                  </span>
                  <p className="text-base font-bold font-mono text-brand-700">
                    {paisaToInr(v.perMinuteRate)}/min
                  </p>
                </Card>

                <Card className="p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Included Pool Balance
                  </span>
                  <p className="text-base font-bold font-mono text-brand-600">
                    {paisaToInr(v.includedBalance)}
                  </p>
                </Card>

                <Card className="p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Low Balance Alert Threshold
                  </span>
                  <p className="text-base font-bold font-mono text-amber-600">
                    {paisaToInr(v.lowBalanceThreshold)}
                  </p>
                </Card>
              </div>
            </div>

            {/* Section: Telephony Rules */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <PhoneCall size={14} className="text-secondary-600" />
                Telephony & Dialing Rules
              </h3>
              <Card className="p-4 divide-y divide-surface-subtle space-y-3 text-base">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Calling Channel Mode
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    {formatEnumText(v.callingChannel)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Minimum Chargeable Sec
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    {v.billingMinimumSec}s
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Billing Increment Pulse
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    Every {v.billingIncrementSec}s
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Auto-Retry Automation
                  </span>
                  <Badge variant={v.retryAutomation ? "success" : "gray"}>
                    {v.retryAutomation ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Section: Seat Caps & Infrastructure Limits */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Users size={14} className="text-info-600" />
                Capacity & Gating Limits
              </h3>
              <Card className="p-4 divide-y divide-surface-subtle space-y-3">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Max Voice Assistants
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    {v.maxAgents ?? "∞ Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Max Workspace Members
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    {v.maxTeamMembers
                      ? `Admin + ${v.maxTeamMembers - 1}`
                      : "∞ Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Max Active Campaigns
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    {v.maxActiveCampaigns ?? "∞ Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Max Batch Lead Upload
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    {v.maxLeadsPerBatch ?? "∞ Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Brochure Vector Feature
                  </span>
                  <Badge variant={v.brochureUpload ? "success" : "gray"}>
                    {v.brochureUpload ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Bonus Expiry Window
                  </span>
                  <span className="font-bold font-mono text-text-primary text-base">
                    {v.bonusValidityDays
                      ? `${v.bonusValidityDays} Days`
                      : "Unlimited"}
                  </span>
                </div>
              </Card>
            </div>

            {/* Section: Software Feature Flags */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Sparkles size={14} className="text-warning-600" />
                Platform Tier Flags
              </h3>
              <Card className="p-4 divide-y divide-surface-subtle space-y-3">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Dashboard Interface
                  </span>
                  <span className="font-bold text-text-primary text-base">
                    {formatEnumText(v.dashboardTier)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    Agent Capability Engine
                  </span>
                  <span className="font-bold text-text-primary text-base">
                    {formatEnumText(v.agentCapability)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-3">
                  <span className="text-text-secondary font-medium text-sm">
                    CRM Integrations Scope
                  </span>
                  <span className="font-bold text-text-primary text-base">
                    {formatEnumText(v.integrations)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-text-secondary font-medium text-sm">
                    SLA Support Level
                  </span>
                  <span className="font-bold text-text-primary text-base">
                    {formatEnumText(v.supportTier)}
                  </span>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-text-muted text-sm border border-dashed border-surface-border rounded-xl">
            <ShieldAlert
              className="mx-auto text-text-placeholder mb-2"
              size={28}
            />
            No active version published for this plan yet.
          </div>
        )}

        {/* Audit Timestamps */}
        <div className="pt-2 flex flex-col gap-1 text-xs text-text-placeholder font-mono text-center">
          <span>Created: {new Date(plan.createdAt).toLocaleString()}</span>
          <span>Modified: {new Date(plan.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </Drawer>
  );
}
