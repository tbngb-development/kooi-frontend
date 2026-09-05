"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMyPlan } from "@/hooks/usePlans";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { RazorpayCheckoutButton } from "@/components/payments/RazorpayCheckoutButton";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { paisaToInr } from "@/constants/config/wallet.config";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

export default function OnboardingPaymentPage() {
  const router = useRouter();
  const { setPaymentRequired } = useAuthStore();
  const { markPaymentDone } = useTenantStore();
  const { data: tenantPlan, isLoading, refetch } = useMyPlan();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  useEffect(() => {
    if (tenantPlan && tenantPlan.status === "ACTIVE") {
      // Sync success state to both stores
      setPaymentRequired(false);
      markPaymentDone();
      router.replace(APP_ROUTES.DASHBOARD);
    }
  }, [tenantPlan, router, setPaymentRequired, markPaymentDone]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-brand-600 h-8 w-8" />
      </div>
    );
  }

  const plan = tenantPlan?.plan;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4 sm:p-6 lg:p-8">
      <Card className="max-w-md w-full p-6 sm:p-8 border border-surface-border bg-surface rounded-xl shadow-md flex flex-col gap-6">
        <div>
          <Badge variant="purple" className="mb-3">
            Workspace Activation
          </Badge>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Activate Workspace
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Complete the activation payment to configure your outbound calling
            campaign suite.
          </p>
        </div>

        {plan && (
          <Card className="p-4 bg-surface-muted border-surface-border divide-y divide-surface-subtle space-y-3">
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-text-placeholder">
                Selected Tier
              </span>
              <span className="text-sm font-bold text-text-primary">
                {plan.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-text-placeholder">
                Onboarding Fee
              </span>
              <span className="text-sm font-bold font-mono text-text-primary">
                {paisaToInr(plan.onboardingFee)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-text-placeholder">
                Per Minute Rate
              </span>
              <span className="text-sm font-bold font-mono text-text-primary">
                {paisaToInr(plan.perMinuteRate)}/min
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold uppercase tracking-wide text-text-placeholder">
                Included Balance Credit
              </span>
              <span className="text-sm font-bold font-mono text-brand-600">
                {paisaToInr(plan.includedBalance)}
              </span>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <RazorpayCheckoutButton
            purpose="ONBOARDING"
            label="Activate & Credit Wallet"
            onSuccess={() => {
              setPaymentRequired(false);
              markPaymentDone();
              refetch();
            }}
            className="w-full h-11 text-base font-semibold"
          />

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-surface-border text-sm font-semibold text-text-secondary hover:bg-surface-subtle transition-all disabled:opacity-50 focus-ring cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-text-placeholder uppercase tracking-wider">
          <ShieldCheck size={14} className="text-brand-500" /> Secure Payment
          Gateway
        </div>
      </Card>
    </div>
  );
}
