"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Card } from "@/components/ui/Card";
import { paisaToInr } from "@/lib/utils/formatMoney";
import { plansApi } from "@/lib/api/plans";
import { paymentsApi } from "@/lib/api/payments";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import {
  RAZORPAY_CHECKOUT_JS,
  RAZORPAY_THEME_COLOR,
} from "@/constants/config/wallet.config";
import { useAuthStore } from "@/store/authStore";
import type { Plan, PlanChangeDirection } from "@/types/plan";
import type {
  RazorpayOptions,
  RazorpayInstance,
} from "@/types/razorpay-checkout";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Wallet,
  Coins,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface SwitchPlanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after the full flow completes (API change + payment verification) */
  onComplete: () => void;
  currentPlan: Plan;
  targetPlan: Plan;
  direction: PlanChangeDirection;
  feeDifference: number;
}

const DIRECTION_CONFIG: Record<
  PlanChangeDirection,
  {
    label: string;
    icon: typeof ArrowUp;
    color: string;
    bg: string;
    border: string;
  }
> = {
  UPGRADE: {
    label: "Upgrade",
    icon: ArrowUp,
    color: "text-brand-700",
    bg: "bg-brand-50",
    border: "border-brand-200",
  },
  DOWNGRADE: {
    label: "Downgrade",
    icon: ArrowDown,
    color: "text-warning-700",
    bg: "bg-warning-50",
    border: "border-warning-200",
  },
  LATERAL: {
    label: "Switch",
    icon: ArrowLeftRight,
    color: "text-info-700",
    bg: "bg-info-50",
    border: "border-info-200",
  },
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_CHECKOUT_JS}"]`)) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_JS;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function SwitchPlanConfirmModal({
  isOpen,
  onClose,
  onComplete,
  currentPlan,
  targetPlan,
  direction,
  feeDifference,
}: SwitchPlanConfirmModalProps) {
  const qc = useQueryClient();
  const { user, memberships, activeTenantId } = useAuthStore();
  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const currentVer = currentPlan.currentVersion;
  const targetVer = targetPlan.currentVersion;
  const dir = DIRECTION_CONFIG[direction];
  const DirIcon = dir.icon;
  const requiresPayment = direction === "UPGRADE" && feeDifference > 0;

  /**
   * Orchestrates the complete Plan Upgrade/Downgrade Flow:
   *
   * Step 1: POST /v1/plans/change
   * Step 2: If result.effectiveImmediately -> Complete flow
   * Step 3: If result.requiresPayment -> POST /v1/payments/create-order { purpose: "PLAN_UPGRADE", newPlanId }
   * Step 4: Open Razorpay checkout frame
   * Step 5: POST /v1/payments/verify
   * Step 6: Trigger cache update and complete
   */
  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      // ── Step 1: Submit change request to check fee difference ──────────────────
      const result = await plansApi.changePlan({
        newPlanId: targetPlan.id,
      });

      if (result.effectiveImmediately) {
        // Downgrade / Lateral or waived fee upgrade - activated right now
        toast.success(
          `Plan changed to ${targetPlan.name} successfully!`,
        );
        qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.all });
        onComplete();
        return;
      }

      // ── Step 2: Payment required - trigger Razorpay upgrade flow ────────────────
      if (result.requiresPayment) {
        await initiateUpgradePayment();
        return;
      }

      // Fallback: Default to complete if no state triggered
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
      onComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change plan.";

      if (msg.includes("CUSTOM_PLAN_REQUIRES_ADMIN")) {
        toast.error(
          "Enterprise plans require admin activation. Please contact support.",
        );
      } else if (msg.includes("SAME_PLAN_VERSION")) {
        toast.info("You are already on this plan.");
      } else if (msg.includes("PLAN_NOT_ACTIVE")) {
        toast.error(
          "Your current plan is not active. Complete onboarding first.",
        );
      } else {
        toast.error(msg);
      }
      setIsProcessing(false);
    }
  };

  const initiateUpgradePayment = async () => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway. Check your network.");
        setIsProcessing(false);
        return;
      }

      // Create upgrade-specific payment order
      const order = await paymentsApi.createOrder({
        purpose: "PLAN_UPGRADE",
        newPlanId: targetPlan.id,
      });

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: activeMembership?.tenantName ?? "KOOI",
        description: `Plan Upgrade — ${currentPlan.name} → ${targetPlan.name}`,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: RAZORPAY_THEME_COLOR },
        modal: {
          ondismiss: () => {
            toast.warning("Payment cancelled. Your plan was not changed.");
            setIsProcessing(false);
          },
        },
        handler: async (response) => {
          try {
            // Verify payment (backend handles automatic plan swap)
            const verification = await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verification.alreadyProcessed) {
              toast.info("Payment has already been processed.");
            } else {
              toast.success(`Plan upgraded to ${targetPlan.name}!`);
            }

            qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
            qc.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.all });
            onComplete();
          } catch {
            toast.error(
              "Payment verification failed. Please contact support if you were charged.",
            );
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const rzp: RazorpayInstance = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to initiate payment.";
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={isProcessing ? () => {} : onClose}
      title={`Confirm Plan ${dir.label}`}
      description={`Review the changes before applying the ${targetPlan.name} plan to your workspace.`}
      size="md"
      disableBackdropClose={isProcessing}
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isProcessing}
            className="w-full sm:w-auto"
            rightIcon={
              isProcessing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )
            }
          >
            {isProcessing
              ? "Processing..."
              : requiresPayment
                ? `Pay ${paisaToInr(feeDifference)} & ${dir.label}`
                : `Confirm ${dir.label}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Plan Transition Visual Card */}
        <Card className="flex items-center justify-between gap-3 p-5 bg-surface-subtle shadow-xs border-surface-border">
          <div className="flex-1 min-w-0 text-center flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-border px-2 py-0.5 rounded-full mb-2">
              Current
            </span>
            <p className="text-base font-extrabold text-text-primary capitalize truncate w-full">
              {currentPlan.name}
            </p>
            <p className="text-xs text-text-secondary font-mono mt-1 font-medium">
              {currentVer
                ? `${paisaToInr(currentVer.onboardingFee)} fee`
                : "—"}
            </p>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${dir.bg} ${dir.color} ${dir.border}`}
          >
            <DirIcon size={18} strokeWidth={2.5} />
          </div>

          <div className="flex-1 min-w-0 text-center flex flex-col items-center">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 border ${dir.bg} ${dir.color} ${dir.border}`}
            >
              Target
            </span>
            <p className="text-base font-extrabold text-text-primary capitalize truncate w-full">
              {targetPlan.name}
            </p>
            <p className={`text-xs font-mono mt-1 font-bold ${dir.color}`}>
              {targetVer
                ? `${paisaToInr(targetVer.onboardingFee)} fee`
                : "—"}
            </p>
          </div>
        </Card>

        {/* Immediate Change / Free Switch Callout */}
        {!requiresPayment && (
          <div className="flex items-start gap-2.5 text-sm text-success-700 bg-success-50 border border-success-100 rounded-xl p-4 shadow-xs">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold">
                No additional payment required.
              </span>
              <span className="text-xs text-success-600 font-medium mt-0.5 leading-relaxed">
                This change will take effect immediately upon confirmation.
              </span>
            </div>
          </div>
        )}

        {/* Upgrade Payment Required Callout */}
        {requiresPayment && (
          <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 shadow-xs space-y-2 text-sm">
            <div className="flex justify-between items-center border-b border-brand-100 pb-2">
              <span className="text-brand-800 font-bold flex items-center gap-2">
                <Wallet size={16} /> Upfront Payment
              </span>
              <span className="font-mono font-extrabold text-brand-700 text-lg">
                {paisaToInr(feeDifference)}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-medium pt-1">
              This covers the onboarding fee difference between your current
              and new plan. Your wallet balance and bonus credits will remain
              untouched.
            </p>
          </div>
        )}

        {/* Downgrade Consequence Warning */}
        {direction === "DOWNGRADE" && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-warning-50 border border-warning-100 shadow-xs">
            <AlertTriangle
              size={18}
              className="shrink-0 text-warning-600 mt-0.5"
            />
            <div className="text-sm text-warning-800">
              <p className="font-bold">Feature limits may be restricted</p>
              <p className="text-xs mt-1 text-warning-700 font-medium leading-relaxed">
                Active campaigns exceeding the new plan&apos;s limit may be
                automatically paused. Your included wallet credit (
                {targetVer ? paisaToInr(targetVer.includedBalance) : "—"})
                and existing bonus balances are preserved.
              </p>
            </div>
          </div>
        )}

        {/* Rate Comparison Table */}
        {currentVer && targetVer && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Commercial Terms Breakdown
            </h4>
            <Card
              padding="none"
              className="overflow-hidden shadow-xs divide-y divide-surface-subtle border-surface-border text-sm"
            >
              <div className="flex justify-between items-center p-3.5">
                <span className="text-text-secondary font-medium flex items-center gap-1.5">
                  <Clock size={14} className="text-text-placeholder" />{" "}
                  Current Rate
                </span>
                <span className="font-mono text-text-muted line-through decoration-text-placeholder">
                  {paisaToInr(currentVer.perMinuteRate)}/min
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-surface-subtle">
                <span className="text-text-primary font-bold flex items-center gap-1.5">
                  <Clock size={14} className={dir.color} /> New Rate
                </span>
                <span className="font-mono font-extrabold text-text-primary">
                  {paisaToInr(targetVer.perMinuteRate)}/min
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5">
                <span className="text-text-secondary font-medium flex items-center gap-1.5">
                  <Coins size={14} className="text-text-placeholder" />{" "}
                  Included Base Wallet
                </span>
                <span className="font-mono font-bold text-brand-600">
                  {paisaToInr(targetVer.includedBalance)}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Drawer>
  );
}