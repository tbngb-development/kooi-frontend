"use client";

import { useState } from "react";
import {
  RECHARGE_SLABS_PAISA,
  paisaToInr,
} from "@/constants/config/wallet.config";
import { RazorpayCheckoutButton } from "@/components/payments/RazorpayCheckoutButton";
import { Card } from "@/components/ui/Card";
import { Sparkles, Coins } from "lucide-react";

interface RechargeSlabsProps {
  onSuccess?: () => void;
}

export function RechargeSlabs({ onSuccess }: RechargeSlabsProps) {
  const [selectedSlab, setSelectedSlab] = useState<number>(
    RECHARGE_SLABS_PAISA[1],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {RECHARGE_SLABS_PAISA.map((slab) => {
          const isSelected = selectedSlab === slab;
          // Apply bonuses optimistically for display
          let bonusText = "";
          if (slab >= 5_000_00) bonusText = "+ ₹500 Bonus";
          if (slab >= 10_000_00) bonusText = "+ ₹1,200 Bonus";
          if (slab >= 25_000_00) bonusText = "+ ₹3,500 Bonus";
          if (slab >= 100_000_00) bonusText = "+ ₹15,000 Bonus";

          return (
            <button
              key={slab}
              type="button"
              onClick={() => setSelectedSlab(slab)}
              className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative focus-ring ${
                isSelected
                  ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm"
                  : "border-surface-border bg-surface hover:border-surface-hover hover:bg-surface-hover/50"
              }`}
            >
              <Coins
                size={16}
                className={
                  isSelected ? "text-brand-600" : "text-text-placeholder"
                }
              />
              <span
                className={`text-base font-bold mt-2 ${isSelected ? "text-brand-800" : "text-text-primary"}`}
              >
                {paisaToInr(slab).replace(".00", "")}
              </span>
              {bonusText && (
                <div
                  className={`mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1 rounded-sm tracking-wide ${
                    isSelected
                      ? "bg-brand-100 text-brand-700"
                      : "bg-secondary-50 text-secondary-600 border border-secondary-100/50"
                  }`}
                >
                  <Sparkles size={8} />
                  <span>{bonusText}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Card className="p-4 bg-surface-muted border-surface-border flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Recharge Amount
          </p>
          <p className="text-lg font-extrabold text-text-primary font-mono mt-0.5">
            {paisaToInr(selectedSlab)}
          </p>
        </div>
        <RazorpayCheckoutButton
          purpose="WALLET_TOPUP"
          amountPaisa={selectedSlab}
          label="Proceed to Secure Checkout"
          onSuccess={onSuccess}
          className="h-10 text-sm font-semibold"
        />
      </Card>
    </div>
  );
}
