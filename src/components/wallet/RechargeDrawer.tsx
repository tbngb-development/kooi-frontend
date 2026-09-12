"use client";

import { Drawer } from "@/components/ui/Drawer";
import { RechargeSlabs } from "@/components/wallet/RechargeSlabs";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { CreditCard, ShieldCheck } from "lucide-react";

interface RechargeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional callback fired when Razorpay payment succeeds */
  onSuccess?: () => void;
}

/**
 * Slide-over wallet recharge drawer.
 * Displays current balance summary, minute-calculated recharge slabs, and secure Razorpay checkout.
 */
export function RechargeDrawer({
  isOpen,
  onClose,
  onSuccess,
}: RechargeDrawerProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Recharge Wallet"
      description="Add calling balance to your account using secure payment."
      size="lg"
      footer={
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <ShieldCheck size={14} className="text-success-600 shrink-0" />
          <span>Payments are processed securely via Razorpay SSL Encryption</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current balance summary card */}
        <WalletBalance />

        {/* Recharge slabs + Razorpay checkout */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-text-primary">
            <CreditCard size={18} className="text-brand-600 shrink-0" />
            Choose Recharge Amount
          </h3>
          <RechargeSlabs onSuccess={handleSuccess} />
        </section>
      </div>
    </Drawer>
  );
}