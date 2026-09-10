"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { paisaToInr } from "@/constants/config/wallet.config";
import type { Plan } from "@/types/plan";
import { ArrowDown, ArrowRight, ArrowUp, AlertTriangle } from "lucide-react";

interface SwitchPlanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: Plan;
  targetPlan: Plan;
  direction: "upgrade" | "downgrade";
  isSwitching: boolean;
}

/**
 * Confirmation modal before switching plans.
 * Shows current → target comparison and warns about billing/limit changes.
 */
export function SwitchPlanConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  targetPlan,
  direction,
  isSwitching,
}: SwitchPlanConfirmModalProps) {
  const isDowngrade = direction === "downgrade";
  const Icon = isDowngrade ? ArrowDown : ArrowUp;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDowngrade ? "Downgrade Plan" : "Upgrade Plan"}
      size="md"
    >
      <div className="space-y-5">
        {/* Plan transition visual */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-surface-muted border border-surface-border">
          <div className="flex-1 min-w-0 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-text-placeholder">
              Current
            </p>
            <p className="text-base font-bold text-text-primary mt-1 capitalize truncate">
              {currentPlan.name}
            </p>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {paisaToInr(currentPlan.perMinuteRate)}/min
            </p>
          </div>

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isDowngrade
                ? "bg-warning-100 text-warning-600"
                : "bg-brand-100 text-brand-600"
            }`}
          >
            <Icon size={16} />
          </div>

          <div className="flex-1 min-w-0 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
              New Plan
            </p>
            <p className="text-base font-bold text-text-primary mt-1 capitalize truncate">
              {targetPlan.name}
            </p>
            <p className="text-xs text-brand-700 font-mono mt-0.5 font-bold">
              {paisaToInr(targetPlan.perMinuteRate)}/min
            </p>
          </div>
        </div>

        {/* Warnings for downgrade */}
        {isDowngrade && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-50 border border-warning-100">
            <AlertTriangle
              size={16}
              className="shrink-0 text-warning-600 mt-0.5"
            />
            <div className="text-sm text-warning-800">
              <p className="font-semibold">Feature limits may be reduced</p>
              <p className="text-xs mt-1 text-warning-700">
                Active campaigns exceeding the new plan&apos;s limit may be
                paused. Please review your usage before continuing.
              </p>
            </div>
          </div>
        )}

        {/* Onboarding fee note */}
        <div className="rounded-lg border border-surface-border bg-surface p-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Onboarding fee</span>
            <span className="font-mono font-bold text-text-primary">
              {paisaToInr(targetPlan.onboardingFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Wallet credit included</span>
            <span className="font-mono font-bold text-brand-600">
              {paisaToInr(targetPlan.includedBalance)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSwitching}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={isSwitching}
            rightIcon={<ArrowRight size={14} />}
          >
            Confirm {isDowngrade ? "Downgrade" : "Upgrade"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
