"use client";

import { useWallet } from "@/hooks/useWallet";
import { useMyPlan } from "@/hooks/usePlans";
import { paisaToInr, paisaToInrShort } from "@/constants/config/wallet.config";
import { Wallet as WalletIcon, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface WalletBalanceProps {
  className?: string;
  mini?: boolean;
}

export function WalletBalance({ className, mini = false }: WalletBalanceProps) {
  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const { data: tenantPlan, isLoading: isPlanLoading } = useMyPlan();

  const isLoading = isWalletLoading || isPlanLoading;

  if (isLoading || !wallet) {
    return (
      <div
        className={cn(
          "h-24 bg-surface-subtle animate-pulse rounded-xl",
          className,
        )}
      />
    );
  }

  const lowBalanceThreshold = tenantPlan?.plan?.lowBalanceThreshold ?? null;
  const isLowBalance =
    lowBalanceThreshold !== null && wallet.balance <= lowBalanceThreshold;

  if (mini) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold",
          isLowBalance
            ? "border-error-100 bg-error-50 text-error-700"
            : "border-surface-border bg-surface text-text-primary",
          className,
        )}
      >
        <WalletIcon
          size={14}
          className={
            isLowBalance
              ? "text-error-500 animate-pulse"
              : "text-text-placeholder"
          }
        />
        <span>{paisaToInrShort(wallet.balance)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 border rounded-xl bg-surface",
        isLowBalance
          ? "border-error-100 bg-error-50/50"
          : "border-surface-border bg-surface",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <WalletIcon
            size={16}
            className={
              isLowBalance
                ? "text-error-500 animate-pulse"
                : "text-text-placeholder"
            }
          />
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Workspace Balance
          </span>
        </div>

        {/* Badge Group Side-by-Side */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isLowBalance && (
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-error-600 bg-error-100/50 px-2 py-0.5 rounded uppercase tracking-wide">
              <AlertTriangle size={10} /> Low Balance
            </div>
          )}
          {wallet.bonusBalance > 0 && (
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-secondary-600 bg-secondary-50 border border-secondary-100 px-2 py-0.5 rounded uppercase tracking-wide animate-pulse">
              <Sparkles size={10} />
              <span>Bonus: {paisaToInr(wallet.bonusBalance)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <h3
          className={cn(
            "text-2xl sm:text-3xl font-bold font-mono tracking-tight",
            isLowBalance ? "text-error-700" : "text-text-primary",
          )}
        >
          {paisaToInr(wallet.balance)}
        </h3>
      </div>
    </div>
  );
}