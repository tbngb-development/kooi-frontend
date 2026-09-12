"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { paisaToInr } from "@/constants/config/wallet.config";
import { cn } from "@/lib/utils/cn";
import { paisaToRupees } from "@/lib/utils/formatMoney";
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
  Info,
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

// ── Enum → Display Helpers ───────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────────────

export function PlanCard({
  plan,
  ctaType,
  isFeatured = false,
  isWorking = false,
  onAction,
}: PlanCardProps) {
  const v = plan.currentVersion;
  const isCurrent = ctaType === "current" || ctaType === "proceed";
  const isCustom = v?.pricingModel === "CUSTOM";
  const highlighted = isCurrent || isFeatured;

  if (!v) {
    return (
      <div className="relative flex w-full">
        <Card className="flex flex-col w-full p-4 sm:p-5 rounded-2xl border-2 border-surface-border bg-surface shadow-sm">
          <div className="pb-4 text-center">
            <h3 className="text-xl font-extrabold text-text-primary capitalize tracking-tight">
              {plan.name}
            </h3>
            <p className="text-sm text-text-muted mt-2">
              Pricing not yet available
            </p>
          </div>
          <div className="mt-auto pt-1">
            <Button
              variant="outline"
              disabled
              className="w-full h-11 text-sm font-bold"
            >
              Coming Soon
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const formattedRate =
    v.pricingModel === "VOLUME"
      ? `Volume (${paisaToInr(v.perMinuteRate)}/min)`
      : isCustom
        ? "Custom Pricing"
        : `${paisaToInr(v.perMinuteRate)}/min`;

  // ✅ Balance only — expiry moved to tooltip
  const formattedBalance = isCustom
    ? "Custom"
    : `₹${paisaToRupees(v.includedBalance)}`;

  const balanceExpiryTooltip =
    !isCustom && v.bonusValidityDays
      ? `Bonus credits valid for ${v.bonusValidityDays} day${v.bonusValidityDays === 1 ? "" : "s"} after activation`
      : null;

  const hasOriginalPrice =
    v.onboardingFeeOriginal !== null &&
    v.onboardingFeeOriginal > v.onboardingFee;

  return (
    <div className="relative flex w-full">
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
        {/* Header */}
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
                      {paisaToInr(v.onboardingFeeOriginal!).replace(".00", "")}
                    </s>
                  )}
                  <p className="text-2xl font-extrabold font-mono tracking-tight text-text-primary">
                    {paisaToInr(v.onboardingFee).replace(".00", "")}
                  </p>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  One-time onboarding
                </p>
              </>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="flex-1 space-y-3 py-4 border-t border-b border-surface-subtle mb-5">
          <FeatureRow label="AI calling" value={formattedRate} />
          <FeatureRow
            label="Active campaigns"
            value={v.maxActiveCampaigns ?? "Unlimited"}
          />
          <FeatureRow label="Max. Agents" value={v.maxAgents ?? "Unlimited"} />
          <FeatureRow
            label="Dashboard"
            value={formatDashboardTier(v.dashboardTier)}
          />

          {/* ✅ Included Balance + info tooltip for expiry */}
          <FeatureRow
            label="Included Balance"
            value={formattedBalance}
            infoTooltip={balanceExpiryTooltip}
          />

          <FeatureRow
            label="Calling channel"
            value={formatCallingChannel(v.callingChannel)}
          />

          <div className="flex items-center justify-between text-[13px] leading-tight">
            <span className="text-text-muted">Brochure Upload</span>
            {v.brochureUpload ? (
              <Check size={15} className="text-brand-600" />
            ) : (
              <X size={15} className="text-text-placeholder" />
            )}
          </div>

          <FeatureRow
            label="Team Size"
            value={formatTeamMembers(v.maxTeamMembers)}
          />
          <FeatureRow
            label="Min. Balance"
            value={paisaToInr(v.lowBalanceThreshold).replace(".00", "")}
          />
          <FeatureRow
            label="Retry automation"
            value={v.retryAutomation ? "Available" : "Not Available"}
          />
          <FeatureRow
            label="Support"
            value={formatSupportTier(v.supportTier)}
          />
        </div>

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

// ── Sub-components ───────────────────────────────────────────────────────────

function FeatureRow({
  label,
  value,
  infoTooltip,
}: {
  label: string;
  value: string | number;
  infoTooltip?: string | null;
}) {
  return (
    <div className="flex items-center justify-between text-[13px] leading-tight gap-2">
      <span className="text-text-muted shrink-0">{label}</span>

      <span className="font-semibold text-text-primary text-right truncate inline-flex items-center justify-end gap-1 min-w-0">
        <span className="truncate">{value}</span>

        {infoTooltip ? (
          <span
            className="relative inline-flex shrink-0"
            title={infoTooltip}
            aria-label={infoTooltip}
          >
            <Info
              size={13}
              className="text-text-muted hover:text-text-secondary transition-colors cursor-help"
              strokeWidth={2.25}
            />
          </span>
        ) : null}
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
