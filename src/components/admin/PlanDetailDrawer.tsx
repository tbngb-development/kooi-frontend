"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  Sliders,
  IndianRupee,
  PhoneCall,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Plan } from "@/types/plan";

interface PlanDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

function paisaToInr(paisa: number): string {
  return `₹${(paisa / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !plan) return null;

  const hasMSRP =
    plan.onboardingFeeOriginal !== null &&
    plan.onboardingFeeOriginal !== undefined &&
    plan.onboardingFeeOriginal > plan.onboardingFee;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl border-l border-surface-border flex flex-col z-10 animate-[slideIn_0.2s_ease-out]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4 shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-base sm:text-lg font-bold text-text-primary truncate">
              {plan.name} Detail Specification
            </h2>
            <p className="text-xs text-text-placeholder font-mono mt-0.5 truncate">
              ID: {plan.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable specs wrapper */}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-5 space-y-6">
          {/* Section: Plan Header Card */}
          <Card className="p-4 bg-surface-muted border-surface-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-text-secondary">
                Identifier Reference
              </p>
              <p className="text-sm font-semibold font-mono text-text-muted mt-0.5">
                {plan.slug}
              </p>
              <Badge
                variant={
                  plan.pricingModel === "CUSTOM"
                    ? "purple"
                    : plan.pricingModel === "VOLUME"
                      ? "blue"
                      : "gray"
                }
                className="mt-2"
              >
                {plan.pricingModel} Model
              </Badge>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge
                variant={plan.isActive ? "success" : "gray"}
                dot={plan.isActive}
              >
                {plan.isActive ? "Active Plan" : "Inactive"}
              </Badge>
              <span className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider">
                Display Order: {plan.displayOrder}
              </span>
            </div>
          </Card>

          {/* Section: Billing / Monetary Tiers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder flex items-center gap-1.5">
              <IndianRupee size={14} className="text-brand-600" />
              Monetary & Rate Tiers
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3.5 space-y-1">
                <span className="text-xs text-text-muted">Onboarding Fee</span>
                <p className="text-lg font-bold font-mono text-text-primary">
                  {paisaToInr(plan.onboardingFee)}
                </p>
                {hasMSRP && (
                  <p className="text-[10px] text-text-placeholder font-mono line-through">
                    MSRP: {paisaToInr(plan.onboardingFeeOriginal!)}
                  </p>
                )}
              </Card>

              <Card className="p-3.5 space-y-1">
                <span className="text-xs text-text-muted">Per Minute Rate</span>
                <p className="text-lg font-bold font-mono text-text-primary">
                  {paisaToInr(plan.perMinuteRate)}
                </p>
              </Card>

              <Card className="p-3.5 space-y-1">
                <span className="text-xs text-text-muted">
                  Included Pool Balance
                </span>
                <p className="text-lg font-bold font-mono text-brand-600">
                  {paisaToInr(plan.includedBalance)}
                </p>
              </Card>

              <Card className="p-3.5 space-y-1">
                <span className="text-xs text-text-muted">
                  Low Balance Alert Threshold
                </span>
                <p className="text-lg font-bold font-mono text-amber-600">
                  {paisaToInr(plan.lowBalanceThreshold)}
                </p>
              </Card>
            </div>
          </div>

          {/* Section: Telephony & Dialing Rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder flex items-center gap-1.5">
              <PhoneCall size={14} className="text-secondary-600" />
              Telephony & Dialing Rules
            </h3>
            <Card className="p-4 divide-y divide-surface-subtle space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-text-secondary font-medium">
                  Calling Channel
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {formatEnumText(plan.callingChannel)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Minimum Chargeable Sec
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.billingMinimumSec}s
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Billing Pulses (Increment)
                </span>
                <span className="font-bold font-mono text-text-primary">
                  Every {plan.billingIncrementSec}s
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-text-secondary font-medium">
                  Auto-Retry Automation
                </span>
                <Badge variant={plan.retryAutomation ? "success" : "gray"}>
                  {plan.retryAutomation ? "Available" : "Disabled"}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Section: Seat Caps & Infrastructure Limits */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder flex items-center gap-1.5">
              <Users size={14} className="text-info-600" />
              Seat Caps & Infrastructure Limits
            </h3>
            <Card className="p-4 divide-y divide-surface-subtle space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-text-secondary font-medium">
                  Max Agents
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.maxAgents ?? "∞ Unlimited"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Max Team Members
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.maxTeamMembers
                    ? `Admin + ${plan.maxTeamMembers - 1}`
                    : "∞ Unlimited"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Max Active Campaigns
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.maxActiveCampaigns ?? "∞ Unlimited"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Max Leads per Upload
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.maxLeadsPerBatch ?? "∞ Unlimited"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Brochure Upload Feature
                </span>
                <Badge variant={plan.brochureUpload ? "success" : "gray"}>
                  {plan.brochureUpload ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-text-secondary font-medium">
                  Bonus Expiry Window
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.bonusValidityDays
                    ? `${plan.bonusValidityDays} Days`
                    : "Persistent"}
                </span>
              </div>
            </Card>
          </div>

          {/* Section: Software Feature Flags */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder flex items-center gap-1.5">
              <Sparkles size={14} className="text-warning-600" />
              SaaS Tier Features
            </h3>
            <Card className="p-4 divide-y divide-surface-subtle space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-text-secondary font-medium">
                  Dashboard Suite
                </span>
                <span className="font-bold text-text-primary">
                  {formatEnumText(plan.dashboardTier)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Agent Capability
                </span>
                <span className="font-bold text-text-primary">
                  {formatEnumText(plan.agentCapability)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Integrations Tier
                </span>
                <span className="font-bold text-text-primary">
                  {formatEnumText(plan.integrations)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-text-secondary font-medium">
                  Support Level
                </span>
                <span className="font-bold text-text-primary">
                  {formatEnumText(plan.supportTier)}
                </span>
              </div>
            </Card>
          </div>

          {/* Audit timestamps */}
          <div className="pt-2 flex flex-col gap-1 text-[10px] text-text-placeholder font-mono leading-normal text-center">
            <span>Created: {new Date(plan.createdAt).toLocaleString()}</span>
            <span>Modified: {new Date(plan.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
