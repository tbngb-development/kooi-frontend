"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ShieldAlert,
  Sparkles,
  Sliders,
  DollarSign,
  Database,
  Check,
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop backdrop-blur-sm */}
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-error-500"
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
              <DollarSign size={14} className="text-brand-600" />
              Monetary & Rate Tiers
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3.5 space-y-1">
                <span className="text-xs text-text-muted">Onboarding Fee</span>
                <p className="text-lg font-bold font-mono text-text-primary">
                  {paisaToInr(plan.onboardingFee)}
                </p>
              </Card>
              <Card className="p-3.5 space-y-1">
                <span className="text-xs text-text-muted">Per Minute Rate</span>
                <p className="text-lg font-bold font-mono text-text-primary">
                  {paisaToInr(plan.perMinuteRate)}
                </p>
              </Card>
              <Card className="p-3.5 space-y-1 col-span-2">
                <span className="text-xs text-text-muted">
                  Included Pool Balance
                </span>
                <p className="text-lg font-bold font-mono text-brand-600">
                  {paisaToInr(plan.includedBalance)}
                </p>
              </Card>
            </div>
          </div>

          {/* Section: Operational Rules & Increments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder flex items-center gap-1.5">
              <Sliders size={14} className="text-secondary-600" />
              Dialer Logic & Increments
            </h3>
            <Card className="p-4 divide-y divide-surface-subtle space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3">
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
                  {plan.retryAutomation ? "System Managed" : "Disabled"}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Section: Feature Caps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder flex items-center gap-1.5">
              <Database size={14} className="text-info-600" />
              Infrastructure Caps & Limits
            </h3>
            <Card className="p-4 divide-y divide-surface-subtle space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-text-secondary font-medium">
                  Max Active Campaigns
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.maxActiveCampaigns ?? "∞"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Max Leads per Upload
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.maxLeadsPerBatch ?? "∞"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Industry Profile Limits
                </span>
                <span className="font-bold font-mono text-text-primary">
                  {plan.industryPackLimit ?? "No limits"}
                </span>
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
              SaaS Feature Gates
            </h3>
            <Card className="p-4 divide-y divide-surface-subtle space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-text-secondary font-medium">
                  Dashboard Suite
                </span>
                <span className="font-bold capitalize text-text-primary">
                  {plan.features.dashboardTier}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  Acoustic Engine Capability
                </span>
                <span className="font-bold capitalize text-text-primary">
                  {plan.features.agentCapability.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 pb-3">
                <span className="text-text-secondary font-medium">
                  CRM & API Integrations
                </span>
                <span className="font-bold capitalize text-text-primary">
                  {plan.features.integrations.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-text-secondary font-medium">
                  SLA Support Level
                </span>
                <span className="font-bold capitalize text-text-primary">
                  {plan.features.supportTier}
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
