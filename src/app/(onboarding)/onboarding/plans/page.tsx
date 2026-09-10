"use client";

import { PlanCard, type PlanCardCTA } from "@/components/plans/PlanCard";
import { UniversalPlanFeatures } from "@/components/plans/UniversalPlanFeatures";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { useLogout } from "@/hooks/useAuth";
import { useAvailablePlans, useMyPlan, useSelectPlan } from "@/hooks/usePlans";
import { useAuthStore } from "@/store/authStore";
import { Loader2, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

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
      <div className="border-b border-surface-border bg-surface">
        <div className="max-w-8xl mx-auto px-6 py-3 flex items-center justify-between">
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

      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Pick the plan that fits your workspace
          </h1>
          <p className="text-base text-text-muted leading-relaxed">
            Transparent per-minute pricing with included wallet credit. Upgrade,
            downgrade, or cancel anytime — no long-term contracts.
          </p>
        </div>

        {/* ✨ Updated Grid: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedPlans.map((plan, idx) => {
            const isCurrent = plan.id === currentPlanId;
            const cta: PlanCardCTA = isCurrent ? "proceed" : "select";

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                ctaType={cta}
                isFeatured={idx === 1}
                isWorking={isWorking}
                onAction={
                  isCurrent
                    ? () => router.push(APP_ROUTES.ONBOARDING_PAYMENT)
                    : () => handleSelectPlan(plan.id)
                }
              />
            );
          })}
        </div>

        {/* ✨ New Footer feature block */}
        <UniversalPlanFeatures />
      </div>
    </div>
  );
}
