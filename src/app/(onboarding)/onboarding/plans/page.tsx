"use client";

import { useAvailablePlans, useSelectPlan, useMyPlan } from "@/hooks/usePlans";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { paisaToInr } from "@/constants/config/wallet.config";
import {
  Check,
  LogOut,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Wallet,
  Megaphone,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { Plan } from "@/types/plan";

/**
 * Onboarding: Plan Selection
 * Displays available subscription tiers to newly registered or invited tenants.
 */
export default function OnboardingPlansPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: plans, isLoading: isPlansLoading } = useAvailablePlans();
  const { data: myPlan, isLoading: isMyPlanLoading } = useMyPlan();
  const { mutate: selectPlan, isPending: isSelecting } = useSelectPlan();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleSelectPlan = (planId: string) => {
    selectPlan(planId, {
      onSuccess: () => router.push(APP_ROUTES.ONBOARDING_PAYMENT),
    });
  };

  const isWorking = isSelecting || isLoggingOut;

  if (isPlansLoading || isMyPlanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner size="lg" label="Loading pricing tiers..." />
      </div>
    );
  }

  const currentPlanId = myPlan?.planId;
  const sortedPlans = [...(plans ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Top Utility Bar */}
      <div className="border-b border-surface-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-text-inverse">
              <Sparkles size={16} />
            </div>
            <span className="text-base font-bold text-text-primary tracking-tight">
              Kooi
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted hidden sm:inline">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              disabled={isLoggingOut}
              leftIcon={
                isLoggingOut ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )
              }
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Pick the plan that fits your workspace
          </h1>
          <p className="text-base text-text-muted leading-relaxed">
            Transparent per-minute pricing with included wallet credit. Upgrade,
            downgrade, or cancel anytime — no long-term contracts.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedPlans.map((plan, idx) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === currentPlanId}
              isFeatured={idx === 1}
              isWorking={isWorking}
              onSelect={() => handleSelectPlan(plan.id)}
              onProceed={() => router.push(APP_ROUTES.ONBOARDING_PAYMENT)}
            />
          ))}
        </div>

        {/* Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4">
          <TrustPill
            icon={<ShieldCheck size={14} />}
            label="Secure Razorpay Checkout"
          />
          <TrustPill
            icon={<RefreshCw size={14} />}
            label="Switch plans anytime"
          />
          <TrustPill
            icon={<Wallet size={14} />}
            label="Onboarding fee = wallet credit"
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Plan Card                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isFeatured: boolean;
  isWorking: boolean;
  onSelect: () => void;
  onProceed: () => void;
}

function PlanCard({
  plan,
  isCurrent,
  isFeatured,
  isWorking,
  onSelect,
  onProceed,
}: PlanCardProps) {
  const highlighted = isCurrent || isFeatured;

  return (
    <div className="relative flex">
      {/* Featured Ribbon */}
      {isFeatured && !isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-secondary-600 text-text-inverse text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Zap size={12} /> Most Popular
        </span>
      )}
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-brand-600 text-text-inverse text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Check size={12} /> Current Selection
        </span>
      )}

      <Card
        className={`flex flex-col w-full p-6 sm:p-7 rounded-2xl border-2 bg-surface transition-all ${
          highlighted
            ? "border-brand-500 shadow-lg shadow-brand-100/50"
            : "border-surface-border hover:border-text-placeholder shadow-sm"
        }`}
      >
        {/* Plan Identity */}
        <div className="pb-5 border-b border-surface-subtle">
          <h3 className="text-xl font-bold text-text-primary capitalize">
            {plan.name}
          </h3>
          <p className="text-sm text-text-muted mt-1 font-mono">{plan.slug}</p>
        </div>

        {/* Pricing Hero */}
        <div className="py-6 space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-placeholder mb-2">
              Call Rate
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-text-primary">
                {paisaToInr(plan.perMinuteRate)}
              </span>
              <span className="text-sm font-semibold text-text-muted">
                / minute
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-dashed border-surface-border">
            <span className="text-sm font-semibold text-text-secondary">
              Onboarding Fee
            </span>
            <span className="text-base font-bold font-mono text-text-primary">
              {paisaToInr(plan.onboardingFee)}
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="flex-1 space-y-3.5 pb-6">
          <FeatureRow
            icon={<Wallet size={14} />}
            label="Wallet Credit Included"
            value={paisaToInr(plan.includedBalance)}
            highlight
          />
          <FeatureRow
            icon={<Megaphone size={14} />}
            label="Active Campaigns"
            value={
              plan.maxActiveCampaigns
                ? `Up to ${plan.maxActiveCampaigns}`
                : "Unlimited"
            }
          />
          <FeatureRow
            icon={<RefreshCw size={14} />}
            label="Retry Automation"
            value={plan.retryAutomation ? "Included" : "Not included"}
            enabled={plan.retryAutomation}
          />
          <FeatureRow
            icon={<ShieldCheck size={14} />}
            label="Support Tier"
            value={
              plan.features.supportTier === "sla"
                ? "SLA-backed"
                : plan.features.supportTier === "priority"
                  ? "Priority"
                  : "Standard"
            }
          />
        </div>

        {/* CTA */}
        <div className="pt-2">
          {isCurrent ? (
            <Button
              onClick={onProceed}
              disabled={isWorking}
              rightIcon={<ArrowRight size={14} />}
              className="w-full h-11 text-sm font-bold"
            >
              Proceed to Payment
            </Button>
          ) : (
            <Button
              variant={isFeatured ? "primary" : "outline"}
              onClick={onSelect}
              loading={isWorking}
              className="w-full h-11 text-sm font-bold"
            >
              Choose {plan.name}
            </Button>
          )}
          <p className="text-xs text-text-placeholder text-center mt-3">
            Billed in {plan.billingIncrementSec}s increments · min{" "}
            {plan.billingMinimumSec}s
          </p>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Small Components                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

interface FeatureRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  enabled?: boolean;
}

function FeatureRow({
  icon,
  label,
  value,
  highlight = false,
  enabled = true,
}: FeatureRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-text-muted">
        <span className={enabled ? "text-brand-600" : "text-text-placeholder"}>
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <span
        className={`font-bold ${
          highlight
            ? "text-brand-600 font-mono"
            : enabled
              ? "text-text-primary"
              : "text-text-placeholder"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
      <span className="text-brand-600">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
