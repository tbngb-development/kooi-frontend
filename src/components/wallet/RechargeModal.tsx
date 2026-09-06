"use client";

import { Modal } from "@/components/ui/Modal";
import { RechargeSlabs } from "@/components/wallet/RechargeSlabs";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { CreditCard } from "lucide-react";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Focused wallet recharge modal.
 * Shows current balance + recharge slabs + secure checkout.
 * Transaction history & threshold live in Settings → Billing.
 */
export function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recharge Wallet" size="xl">
      <div className="space-y-6">
        {/* Current balance summary */}
        <WalletBalance />

        {/* Recharge slabs + Razorpay checkout */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
            <CreditCard size={15} />
            Choose Recharge Amount
          </h3>
          <RechargeSlabs />
        </section>

        <p className="text-xs text-text-muted text-center pt-2 border-t border-surface-subtle">
          Payments are processed securely via Razorpay.
        </p>
      </div>
    </Modal>
  );
}
