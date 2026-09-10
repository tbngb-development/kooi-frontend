"use client";

import { PlanCard, type PlanCardCTA } from "@/components/plans/PlanCard";
import { SwitchPlanConfirmModal } from "@/components/plans/SwitchPlanConfirmModal";
import { UniversalPlanFeatures } from "@/components/plans/UniversalPlanFeatures";
import { Spinner } from "@/components/ui/Spinner";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { useAvailablePlans, useMyPlan, useSelectPlan } from "@/hooks/usePlans";
import { useAuthStore } from "@/store/authStore";
import type { Plan } from "@/types/plan";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function PlansPage() {
  const router = useRouter();
  const { user, memberships, activeTenantId } = useAuthStore();

  const activeRole = memberships.find(
    (m) => m.tenantId === activeTenantId,
  )?.role;
  const isOwner = activeRole === "OWNER" || !!user?.isPlatformAdmin;

  const { data: plans, isLoading: isPlansLoading } = useAvailablePlans();
  const { data: tenantPlan, isLoading: isMyPlanLoading } = useMyPlan();
  const { mutate: selectPlan, isPending: isSwitching } = useSelectPlan();

  const [pendingSwitch, setPendingSwitch] = useState<Plan | null>(null);

  const sortedPlans = useMemo(
    () => [...(plans ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [plans],
  );

  const currentPlan = tenantPlan?.plan ?? null;

  const handleConfirmSwitch = () => {
    if (!pendingSwitch) return;
    selectPlan(pendingSwitch.id, {
      onSuccess: () => {
        setPendingSwitch(null);
        router.push(APP_ROUTES.SETTINGS);
      },
    });
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

        {/* ✨ Updated Grid: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedPlans.map((plan, idx) => {
            const cta = resolveCTAForDashboard({ plan, currentPlan, isOwner });
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                ctaType={cta}
                isFeatured={idx === 1}
                isWorking={isSwitching}
                onAction={
                  cta === "upgrade" || cta === "downgrade"
                    ? () => setPendingSwitch(plan)
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {/* ✨ New Footer feature block */}
      <UniversalPlanFeatures />

      {pendingSwitch && currentPlan && (
        <SwitchPlanConfirmModal
          isOpen={!!pendingSwitch}
          onClose={() => !isSwitching && setPendingSwitch(null)}
          onConfirm={handleConfirmSwitch}
          currentPlan={currentPlan}
          targetPlan={pendingSwitch}
          direction={
            pendingSwitch.perMinuteRate < currentPlan.perMinuteRate
              ? "upgrade"
              : "downgrade"
          }
          isSwitching={isSwitching}
        />
      )}
    </div>
  );
}

function resolveCTAForDashboard({
  plan,
  currentPlan,
  isOwner,
}: {
  plan: Plan;
  currentPlan: Plan | null;
  isOwner: boolean;
}): PlanCardCTA {
  if (!currentPlan) return isOwner ? "select" : "view-only";
  if (plan.id === currentPlan.id) return "current";
  if (!isOwner) return "view-only";
  return plan.perMinuteRate < currentPlan.perMinuteRate
    ? "upgrade"
    : "downgrade";
}
