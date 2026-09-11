"use client";

import { PlanCard, type PlanCardCTA } from "@/components/plans/PlanCard";
import { SwitchPlanConfirmModal } from "@/components/plans/SwitchPlanConfirmModal";
import { UniversalPlanFeatures } from "@/components/plans/UniversalPlanFeatures";
import { Spinner } from "@/components/ui/Spinner";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { useAvailablePlans, useMyPlan } from "@/hooks/usePlans";
import { useAuthStore } from "@/store/authStore";
import type { Plan, PlanChangeDirection } from "@/types/plan";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  const sortedPlans = useMemo(
    () => [...(plans ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [plans],
  );

  const currentPlanId = tenantPlan?.planId ?? null;
  const currentPlan = sortedPlans.find((p) => p.id === currentPlanId) ?? null;
  const currentFee =
    tenantPlan?.effectiveTerms?.onboardingFee ??
    currentPlan?.currentVersion?.onboardingFee ??
    0;

  /**
   * Called only when the full switch sequence successfully completes
   * (e.g. either immediately waived, or Razorpay payment is verified).
   */
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
          Plans & Pricing
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Compare tiers and switch to the plan that fits your workspace.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-5 mt-4">
          All Available Plans
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedPlans.map((plan, idx) => {
            const cta = resolveCTA({ plan, currentPlanId, isOwner });
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
      </div>

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
  isOwner,
}: {
  plan: Plan;
  currentPlanId: string | null;
  isOwner: boolean;
}): PlanCardCTA {
  if (!currentPlanId) return isOwner ? "select" : "view-only";
  if (plan.id === currentPlanId) return "current";
  if (!isOwner) return "view-only";
  if (plan.currentVersion?.pricingModel === "CUSTOM") return "view-only";
  return "upgrade";
}
