"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Check,
  CreditCard,
  IndianRupee,
  Mail,
  PhoneCall,
  Shield,
  Sparkles,
} from "lucide-react";

import { PlanCard, type PlanCardCTA } from "@/components/plans/PlanCard";
import { SwitchPlanConfirmModal } from "@/components/plans/SwitchPlanConfirmModal";
import { UniversalPlanFeatures } from "@/components/plans/UniversalPlanFeatures";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { useAvailablePlans, useMyPlan } from "@/hooks/usePlans";
import { useAuthStore } from "@/store/authStore";
import type { Plan, PlanChangeDirection } from "@/types/plan";

export default function PlansPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, memberships, activeTenantId } = useAuthStore();

  const activeRole = memberships.find(
    (m) => m.tenantId === activeTenantId,
  )?.role;
  const isOwner = activeRole === "OWNER" || !!user?.isPlatformAdmin;

  const { data: plans, isLoading: isPlansLoading } = useAvailablePlans();
  const { data: tenantPlan, isLoading: isMyPlanLoading } = useMyPlan();

  const [pendingSwitch, setPendingSwitch] = useState<Plan | null>(null);

  // Standard catalog only (exclude CUSTOM / enterprise from card grid)
  const standardPlans = useMemo(() => {
    return [...(plans ?? [])]
      .filter((p) => p.currentVersion?.pricingModel !== "CUSTOM")
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 3); // hard-cap to 3 public tiers
  }, [plans]);

  const currentPlanId = tenantPlan?.planId ?? null;
  const currentPlan =
    standardPlans.find((p) => p.id === currentPlanId) ??
    plans?.find((p) => p.id === currentPlanId) ??
    null;

  const currentFee =
    tenantPlan?.effectiveTerms?.onboardingFee ??
    currentPlan?.currentVersion?.onboardingFee ??
    0;

  const handleSwitchComplete = () => {
    setPendingSwitch(null);
    qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.all });
    router.push(APP_ROUTES.SETTINGS);
  };

  if (isPlansLoading || isMyPlanLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" label="Loading pricing tiers..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          <CreditCard size={24} className="text-brand-600" />
          Plans & Pricing
        </h1>
        <p className="text-sm text-text-muted mt-1 max-w-2xl">
          Choose a standard tier for self-serve billing, or talk to sales for
          custom enterprise volume, SLAs, and dedicated infrastructure.
        </p>
      </div>

      {/* 3 Standard Plan Cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {standardPlans.map((plan, idx) => {
            const cta = resolveCTA({
              plan,
              currentPlanId,
              currentFee,
              isOwner,
            });

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                ctaType={cta}
                isFeatured={idx === 1}
                isWorking={false}
                onAction={
                  cta === "upgrade" || cta === "downgrade" || cta === "select"
                    ? () => setPendingSwitch(plan)
                    : undefined
                }
              />
            );
          })}
        </div>

        {standardPlans.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm text-text-muted">
              No standard plans are published yet.
            </p>
          </Card>
        )}
      </section>

      {/* Full-width Enterprise CTA */}
      <EnterpriseSalesCard />

      <UniversalPlanFeatures />

      {pendingSwitch && currentPlan && (
        <SwitchPlanConfirmModal
          isOpen={!!pendingSwitch}
          onClose={() => setPendingSwitch(null)}
          onComplete={handleSwitchComplete}
          currentPlan={currentPlan}
          targetPlan={pendingSwitch}
          direction={resolveDirection(pendingSwitch, currentFee)}
          feeDifference={Math.max(
            0,
            (pendingSwitch.currentVersion?.onboardingFee ?? 0) - currentFee,
          )}
        />
      )}
    </div>
  );
}

// ── Enterprise full-width band ───────────────────────────────────────────────

function EnterpriseSalesCard() {
  return (
    <section>
      <Card className="relative overflow-hidden border border-surface-border p-0 shadow-sm">
        {/* soft brand wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-surface to-secondary-50/40 pointer-events-none" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            {/* Copy */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 mb-3">
                <Sparkles size={12} />
                Enterprise
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Need custom volume, pricing, or dedicated infrastructure?
              </h2>
              <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
                Our Enterprise package is tailored for high-throughput teams.
                Get custom commercial terms, advanced security controls,
                dedicated calling channels, priority SLA support, and
                white-glove onboarding — scoped to your usage.
              </p>

              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <EnterprisePoint text="Custom per-minute & volume pricing" />
                <EnterprisePoint text="Dedicated numbers & calling channels" />
                <EnterprisePoint text="Priority / SLA-backed support" />
                <EnterprisePoint text="Advanced security & procurement review" />
              </ul>
            </div>

            {/* CTA panel */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 text-brand-700">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-text-primary">
                      Talk to Sales
                    </p>
                    <p className="text-xs text-text-muted font-medium">
                      Custom quote in 1–2 business days
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-text-secondary">
                  <p className="flex items-center gap-2">
                    <IndianRupee size={14} className="text-text-placeholder" />
                    Custom per-minute & volume pricing
                  </p>
                  <p className="flex items-center gap-2">
                    <Shield size={14} className="text-text-placeholder" />
                    Security & compliance review
                  </p>
                  <p className="flex items-center gap-2">
                    <PhoneCall size={14} className="text-text-placeholder" />
                    High-volume call architecture
                  </p>
                </div>

                <Button
                  className="w-full h-11 font-bold"
                  leftIcon={<Mail size={16} />}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function EnterprisePoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-text-secondary font-medium">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Check size={10} strokeWidth={3} />
      </span>
      <span>{text}</span>
    </li>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveDirection(
  targetPlan: Plan,
  currentFee: number,
): PlanChangeDirection {
  const targetFee = targetPlan.currentVersion?.onboardingFee ?? 0;
  if (targetFee > currentFee) return "UPGRADE";
  if (targetFee < currentFee) return "DOWNGRADE";
  return "LATERAL";
}

function resolveCTA({
  plan,
  currentPlanId,
  currentFee,
  isOwner,
}: {
  plan: Plan;
  currentPlanId: string | null;
  currentFee: number;
  isOwner: boolean;
}): PlanCardCTA {
  if (!currentPlanId) return isOwner ? "select" : "view-only";
  if (plan.id === currentPlanId) return "current";
  if (!isOwner) return "view-only";
  if (plan.currentVersion?.pricingModel === "CUSTOM") return "view-only";

  const targetFee = plan.currentVersion?.onboardingFee ?? 0;
  if (targetFee > currentFee) return "upgrade";
  if (targetFee < currentFee) return "downgrade";
  return "select";
}
