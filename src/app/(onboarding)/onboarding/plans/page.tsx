"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  IndianRupee,
  Loader2,
  LogOut,
  Mail,
  PhoneCall,
  Shield,
  Sparkles,
} from "lucide-react";

import { PlanCard, type PlanCardCTA } from "@/components/plans/PlanCard";
import { UniversalPlanFeatures } from "@/components/plans/UniversalPlanFeatures";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { useLogout } from "@/hooks/useAuth";
import { useAvailablePlans, useMyPlan, useSelectPlan } from "@/hooks/usePlans";
import { useAuthStore } from "@/store/authStore";

export default function OnboardingPlansPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: plans, isLoading: isPlansLoading } = useAvailablePlans();
  const { data: myPlan, isLoading: isMyPlanLoading } = useMyPlan();
  const { mutate: selectPlan, isPending: isSelecting } = useSelectPlan();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Standard catalog only (exclude CUSTOM / enterprise from card grid)
  const standardPlans = useMemo(() => {
    return [...(plans ?? [])]
      .filter((p) => p.currentVersion?.pricingModel !== "CUSTOM")
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, 3); // hard-cap to 3 public tiers
  }, [plans]);

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

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      {/* ── Onboarding Top Navigation ── */}
      <div className="border-b border-surface-border bg-surface shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
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

      {/* ── Main Layout (Matches Dashboard PlansPage) ── */}
      <div className="flex-1 flex flex-col gap-8 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            Pick the plan that fits your workspace
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            Choose a standard tier for self-serve billing, or talk to sales for
            custom enterprise volume, SLAs, and dedicated infrastructure.
          </p>
        </div>

        {/* 3 Standard Plan Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {standardPlans.map((plan, idx) => {
              const isCurrent = plan.id === currentPlanId;
              // Specific CTA resolution for Onboarding
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

          {standardPlans.length === 0 && (
            <Card className="p-8 text-center border-dashed mt-5">
              <p className="text-sm text-text-muted">
                No standard plans are published yet.
              </p>
            </Card>
          )}
        </section>

        {/* Full-width Enterprise CTA */}
        <EnterpriseSalesCard />

        {/* Universal Features */}
        <UniversalPlanFeatures />
      </div>
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
