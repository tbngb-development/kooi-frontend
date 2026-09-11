"use client";

import { useWallet } from "@/hooks/useWallet";
import { useMyPlan } from "@/hooks/usePlans";
import { paisaToInr, paisaToInrShort } from "@/constants/config/wallet.config";
import {
  Wallet as WalletIcon,
  Sparkles,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface WalletBalanceProps {
  className?: string;
  mini?: boolean;
}

/** Check if bonus expires within 3 days */
function isBonusExpiringSoon(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return diffMs > 0 && diffMs <= 3 * 24 * 60 * 60 * 1000;
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

  const lowBalanceThreshold =
    tenantPlan?.effectiveTerms?.lowBalanceThreshold ?? null;
  const isLowBalance =
    lowBalanceThreshold !== null && wallet.totalBalance <= lowBalanceThreshold;
  const bonusExpiring = isBonusExpiringSoon(wallet.bonusExpiresAt);

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
        <span>{paisaToInrShort(wallet.totalBalance)}</span>
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

        {/* Badge Group */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isLowBalance && (
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-error-600 bg-error-100/50 px-2 py-0.5 rounded uppercase tracking-wide">
              <AlertTriangle size={10} /> Low Balance
            </div>
          )}
          {wallet.bonusBalance > 0 && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide",
                bonusExpiring
                  ? "text-warning-700 bg-warning-50 border border-warning-200"
                  : "text-secondary-600 bg-secondary-50 border border-secondary-100",
              )}
            >
              {bonusExpiring ? <Clock size={10} /> : <Sparkles size={10} />}
              <span>Bonus: {paisaToInr(wallet.bonusBalance)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary balance */}
      <div className="mt-3">
        <h3
          className={cn(
            "text-2xl sm:text-3xl font-bold font-mono tracking-tight",
            isLowBalance ? "text-error-700" : "text-text-primary",
          )}
        >
          {paisaToInr(wallet.totalBalance)}
        </h3>
        {/* Cash / Bonus breakdown */}
        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
          <span>Cash: {paisaToInr(wallet.cashBalance)}</span>
          {wallet.bonusBalance > 0 && (
            <span>Bonus: {paisaToInr(wallet.bonusBalance)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
