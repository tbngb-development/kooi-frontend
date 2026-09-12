"use client";

import { useState } from "react";
import {
  RECHARGE_SLABS_PAISA,
  paisaToInr,
} from "@/constants/config/wallet.config";
import { RazorpayCheckoutButton } from "@/components/payments/RazorpayCheckoutButton";
import { Card } from "@/components/ui/Card";
import { useTenantStore } from "@/store/tenantStore";
import { Coins, PhoneCall, AlertCircle } from "lucide-react";

interface RechargeSlabsProps {
  onSuccess?: () => void;
}

/**
 * Calculates exact calling minutes from slab amount and per-minute rate.
 * Both `slabPaisa` and `ratePaisa` are stored in Paisa.
 */
function calculateMinutes(slabPaisa: number, ratePaisa: number): number {
  if (!ratePaisa || ratePaisa <= 0) return 0;
  return slabPaisa / ratePaisa;
}

/**
 * Formats minutes cleanly for Indian locale.
 * e.g., 1250 -> "1,250", 1250.5 -> "1,250.50"
 */
function formatMinutes(minutes: number): string {
  if (minutes % 1 === 0) {
    return minutes.toLocaleString("en-IN");
  }
  return minutes.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function RechargeSlabs({ onSuccess }: RechargeSlabsProps) {
  const { activePlan } = useTenantStore();
  const [selectedSlab, setSelectedSlab] = useState<number>(
    RECHARGE_SLABS_PAISA[1],
  );

  const perMinuteRatePaisa = activePlan?.perMinuteRate;
  const hasValidRate =
    perMinuteRatePaisa !== undefined && perMinuteRatePaisa > 0;

  const selectedMinutes = hasValidRate
    ? calculateMinutes(selectedSlab, perMinuteRatePaisa)
    : 0;

  return (
    <div className="space-y-4">
      {/* Grid: 2 columns on mobile, 3 on intermediate, 5 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
        {RECHARGE_SLABS_PAISA.map((slab) => {
          const isSelected = selectedSlab === slab;
          const totalMinutes = hasValidRate
            ? calculateMinutes(slab, perMinuteRatePaisa)
            : 0;

          return (
            <button
              key={slab}
              type="button"
              onClick={() => setSelectedSlab(slab)}
              className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative focus-ring min-h-[110px] ${
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
                className={`text-base font-bold mt-2 ${
                  isSelected ? "text-brand-800" : "text-text-primary"
                }`}
              >
                {paisaToInr(slab).replace(".00", "")}
              </span>

              {/* Exact calculated total call capacity */}
              {hasValidRate ? (
                <div
                  className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm tracking-wide ${
                    isSelected
                      ? "bg-brand-100 text-brand-700"
                      : "bg-secondary-50 text-secondary-600 border border-secondary-100/50"
                  }`}
                >
                  <PhoneCall size={9} />
                  <span>{formatMinutes(totalMinutes)} MINS</span>
                </div>
              ) : (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-text-placeholder px-1">
                  <AlertCircle size={10} />
                  <span>No rate set</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Checkout Row: Stacked on mobile, row on larger layouts */}
      <Card className="p-4 bg-surface-muted border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Recharge Amount
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mt-0.5">
            <p className="text-lg sm:text-xl font-extrabold text-text-primary font-mono leading-none">
              {paisaToInr(selectedSlab)}
            </p>
          </div>
        </div>
        <RazorpayCheckoutButton
          purpose="WALLET_TOPUP"
          amountPaisa={selectedSlab}
          label="Proceed to Secure Checkout"
          onSuccess={onSuccess}
          className="h-10 text-sm font-semibold w-full sm:w-auto shrink-0 justify-center"
        />
      </Card>
    </div>
  );
}
