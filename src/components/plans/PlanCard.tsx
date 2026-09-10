"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { paisaToInr } from "@/constants/config/wallet.config";
import { cn } from "@/lib/utils/cn";
import type {
  CallingChannel,
  DashboardTier,
  Plan,
  SupportTier,
} from "@/types/plan";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  PhoneCall,
  X,
  Zap,
} from "lucide-react";

export type PlanCardCTA =
  | "select"
  | "proceed"
  | "current"
  | "upgrade"
  | "downgrade"
  | "view-only";

interface PlanCardProps {
  plan: Plan;
  ctaType: PlanCardCTA;
  isFeatured?: boolean;
  isWorking?: boolean;
  onAction?: () => void;
}

// ── Helpers for API Enum -> Display Text ──
function formatCallingChannel(channel: CallingChannel): string {
  switch (channel) {
    case "DEDICATED_WITH_NUMBER":
      return "Dedicated + Num";
    case "DEDICATED":
      return "Dedicated";
    case "SHARED":
    default:
      return "Shared";
  }
}

function formatDashboardTier(tier: DashboardTier): string {
  switch (tier) {
    case "BASIC":
      return "Basic";
    case "STANDARD":
      return "Standard";
    case "ADVANCED":
      return "Advanced";
    case "CUSTOM":
      return "Custom";
  }
}

function formatSupportTier(tier: SupportTier): string {
  switch (tier) {
    case "PRIORITY":
      return "Priority";
    case "SLA":
      return "SLA";
    case "STANDARD":
    default:
      return "Standard";
  }
}

function formatTeamMembers(max: number | null): string {
  if (max === null) return "Unlimited";
  if (max <= 1) return "Admin only";
  return `Admin + ${max - 1}`;
}

export function PlanCard({
  plan,
  ctaType,
  isFeatured = false,
  isWorking = false,
  onAction,
}: PlanCardProps) {
  const isCurrent = ctaType === "current" || ctaType === "proceed";
  const isCustom = plan.pricingModel === "CUSTOM";
  const highlighted = isCurrent || isFeatured;

  // Rate text
  const formattedRate =
    plan.pricingModel === "VOLUME"
      ? `Volume (${paisaToInr(plan.perMinuteRate)}/min)`
      : isCustom
        ? "Custom Pricing"
        : `${paisaToInr(plan.perMinuteRate)}/min`;

  // Included balance & validity
  const formattedBalance = isCustom
    ? "Custom"
    : plan.bonusValidityDays
      ? `${paisaToInr(plan.includedBalance)} - ${plan.bonusValidityDays} days validity`
      : paisaToInr(plan.includedBalance);

  // Strikethrough pricing logic
  const hasOriginalPrice =
    plan.onboardingFeeOriginal !== null &&
    plan.onboardingFeeOriginal > plan.onboardingFee;

  return (
    <div className="relative flex w-full">
      {/* Ribbon Badges */}
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-brand-600 text-text-inverse text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap">
          <Check size={12} /> Current Plan
        </span>
      )}
      {isFeatured && !isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-500 text-amber-950 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap">
          <Zap size={12} className="fill-amber-950" /> Recommended
        </span>
      )}

      <Card
        className={cn(
          "flex flex-col w-full p-4 sm:p-5 rounded-2xl border-2 bg-surface transition-all",
          highlighted
            ? "border-brand-500 shadow-lg shadow-brand-100/50"
            : "border-surface-border hover:border-surface-hover shadow-sm",
        )}
      >
        {/* Header — name + onboarding fee */}
        <div className="pb-4 text-center">
          <h3 className="text-xl font-extrabold text-text-primary capitalize tracking-tight">
            {plan.name}
          </h3>

          <div className="mt-2 flex flex-col items-center gap-0.5">
            {isCustom ? (
              <p className="text-sm font-bold text-brand-600">Custom pricing</p>
            ) : (
              <>
                <div className="flex items-baseline justify-center gap-1.5 flex-wrap">
                  {hasOriginalPrice && (
                    <s className="text-sm text-text-placeholder font-medium line-through">
                      {paisaToInr(plan.onboardingFeeOriginal!).replace(
                        ".00",
                        "",
                      )}
                    </s>
                  )}
                  <p className="text-2xl font-extrabold font-mono tracking-tight text-text-primary">
                    {paisaToInr(plan.onboardingFee).replace(".00", "")}
                  </p>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  One-time onboarding
                </p>
              </>
            )}
          </div>
        </div>

        {/* Dense Specification List */}
        <div className="flex-1 space-y-3 py-4 border-t border-b border-surface-subtle mb-5">
          <FeatureRow label="AI calling" value={formattedRate} />

          <FeatureRow
            label="Active campaigns"
            value={plan.maxActiveCampaigns ?? "Custom / Unlimited"}
          />
          <FeatureRow
            label="Max. Agents"
            value={plan.maxAgents ?? "Unlimited"}
          />
          <FeatureRow
            label="Dashboard"
            value={formatDashboardTier(plan.dashboardTier)}
          />
          <FeatureRow label="Included Balance" value={formattedBalance} />
          <FeatureRow
            label="Calling channel"
            value={formatCallingChannel(plan.callingChannel)}
          />

          {/* Brochure Feature Boolean */}
          <div className="flex items-center justify-between text-[13px] leading-tight">
            <span className="text-text-muted">Brochure Upload</span>
            {plan.brochureUpload ? (
              <Check size={15} className="text-brand-600" />
            ) : (
              <X size={15} className="text-text-placeholder" />
            )}
          </div>

          <FeatureRow
            label="Team Size"
            value={formatTeamMembers(plan.maxTeamMembers)}
          />
          <FeatureRow
            label="Credit Limit"
            value={paisaToInr(plan.lowBalanceThreshold).replace(".00", "")}
          />
          <FeatureRow
            label="Retry automation"
            value={plan.retryAutomation ? "Available" : "Not Available"}
          />
          <FeatureRow
            label="Support"
            value={formatSupportTier(plan.supportTier)}
          />
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <PlanCardCTAButton
            ctaType={ctaType}
            planName={plan.name}
            isFeatured={isFeatured}
            isWorking={isWorking}
            isCustom={isCustom}
            onAction={onAction}
          />
        </div>
      </Card>
    </div>
  );
}

function FeatureRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between text-[13px] leading-tight gap-2">
      <span className="text-text-muted shrink-0">{label}</span>
      <span className="font-semibold text-text-primary text-right truncate">
        {value}
      </span>
    </div>
  );
}

function PlanCardCTAButton({
  ctaType,
  planName,
  isFeatured,
  isWorking,
  isCustom,
  onAction,
}: {
  ctaType: PlanCardCTA;
  planName: string;
  isFeatured?: boolean;
  isWorking?: boolean;
  isCustom?: boolean;
  onAction?: () => void;
}) {
  const base = "w-full h-11 text-sm font-bold";

  // Enterprise / Custom CTA Override
  if (isCustom) {
    return (
      <Button
        variant="outline"
        onClick={() => (window.location.href = "mailto:support@kooi.io")}
        leftIcon={<PhoneCall size={14} />}
        className={cn(
          base,
          "border-brand-600 text-brand-700 hover:bg-brand-50",
        )}
      >
        Contact Us
      </Button>
    );
  }

  switch (ctaType) {
    case "current":
      return (
        <Button variant="outline" disabled className={base}>
          Current Plan
        </Button>
      );
    case "proceed":
      return (
        <Button
          onClick={onAction}
          disabled={isWorking}
          rightIcon={<ArrowRight size={14} />}
          className={base}
        >
          Proceed to Payment
        </Button>
      );
    case "select":
      return (
        <Button
          variant={isFeatured ? "primary" : "outline"}
          onClick={onAction}
          loading={isWorking}
          className={base}
        >
          Choose {planName}
        </Button>
      );
    case "upgrade":
      return (
        <Button
          onClick={onAction}
          loading={isWorking}
          leftIcon={<ArrowUp size={14} />}
          className={base}
        >
          Upgrade
        </Button>
      );
    case "downgrade":
      return (
        <Button
          variant="outline"
          onClick={onAction}
          loading={isWorking}
          leftIcon={<ArrowDown size={14} />}
          className={base}
        >
          Downgrade
        </Button>
      );
    case "view-only":
      return (
        <Button variant="outline" disabled className={base}>
          Contact Admin
        </Button>
      );
  }
}
