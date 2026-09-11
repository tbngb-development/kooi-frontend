"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { paisaToInr } from "@/constants/config/wallet.config";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import type { TenantPlan } from "@/types/plan";
import type { Wallet } from "@/types/wallet";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

interface CurrentPlanHeroProps {
  tenantPlan: TenantPlan;
  wallet?: Wallet | null;
}

/**
 * Returns a human-readable relative label for bonus expiry.
 * Shows a warning when ≤ 3 days remain.
 */
function getBonusExpiryInfo(expiresAt: string | null): {
  label: string;
  isUrgent: boolean;
} | null {
  if (!expiresAt) return null;
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) return { label: "Expired", isUrgent: true };

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 3)
    return { label: `Expires in ${diffDays}d`, isUrgent: true };
  return {
    label: `Expires ${new Date(expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
    isUrgent: false,
  };
}

export function CurrentPlanHero({ tenantPlan, wallet }: CurrentPlanHeroProps) {
  const terms = tenantPlan.effectiveTerms;
  const bonusInfo = getBonusExpiryInfo(tenantPlan.bonusExpiresAt);

  return (
    <Card className="p-6 sm:p-7 border-2 border-brand-500 bg-gradient-to-br from-brand-50/40 to-surface shadow-md shadow-brand-100/50">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Identity */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <CheckCircle2 size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Your Active Plan
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary capitalize">
                {terms.planName}
              </h2>
              <Badge variant="success" dot>
                {tenantPlan.status}
              </Badge>
              {terms.isCustomPriced && (
                <Badge variant="purple">Custom Pricing</Badge>
              )}
            </div>
            <p className="text-sm text-text-muted mt-1.5">
              <span className="font-mono font-bold text-text-primary">
                {terms.pricingModel === "CUSTOM"
                  ? "Custom Rate"
                  : `${paisaToInr(terms.perMinuteRate)} / min`}
              </span>
              <span className="mx-2 text-text-placeholder">·</span>
              <span>Billed in {terms.billingIncrementSec}s increments</span>
              <span className="mx-2 text-text-placeholder">·</span>
              <span>
                Low balance alert at {paisaToInr(terms.lowBalanceThreshold)}
              </span>
            </p>
          </div>
        </div>

        {/* Stats & Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-4 lg:min-w-[240px]">
          <div className="flex-1 lg:flex-none px-4 py-3 rounded-lg bg-surface border border-surface-border space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-text-placeholder">
              Workspace Balance
            </p>
            <p className="text-lg font-bold font-mono text-text-primary mt-0.5">
              {wallet ? paisaToInr(wallet.totalBalance) : "—"}
            </p>
            {/* Bonus expiry badge */}
            {wallet && wallet.bonusBalance > 0 && bonusInfo && (
              <div
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  bonusInfo.isUrgent
                    ? "text-warning-700 bg-warning-50 border border-warning-200"
                    : "text-secondary-600 bg-secondary-50 border border-secondary-100"
                }`}
              >
                {bonusInfo.isUrgent ? (
                  <Clock size={10} />
                ) : (
                  <Sparkles size={10} />
                )}
                {bonusInfo.label}
              </div>
            )}
          </div>
          <Link
            href={APP_ROUTES.SETTINGS}
            className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-lg text-sm font-semibold text-brand-700 border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors focus-ring"
          >
            View Billing
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
