"use client";

import { paisaToInr } from "@/constants/config/wallet.config";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle, Wallet } from "lucide-react";

interface SidebarWalletCardProps {
  onRechargeClick: () => void;
  className?: string;
}

/**
 * Compact, space-efficient wallet card for the sidebar.
 * Reduced vertical footprint with inline balance display.
 */
export function SidebarWalletCard({
  onRechargeClick,
  className,
}: SidebarWalletCardProps) {
  const { data: wallet, isLoading } = useWallet();

  if (isLoading) {
    return (
      <div
        className={cn(
          "h-[46px] rounded-lg bg-zinc-800/60 animate-pulse",
          className,
        )}
      />
    );
  }

  if (!wallet) return null;

  const isLowBalance =
    wallet.lowBalanceThreshold != null &&
    wallet.balance <= wallet.lowBalanceThreshold;

  return (
    <button
      type="button"
      onClick={onRechargeClick}
      aria-label="Open wallet — view balance and recharge"
      className={cn(
        "group relative w-full overflow-hidden rounded-lg px-2.5 py-2 text-left transition-all duration-150 focus-ring cursor-pointer",
        "bg-gradient-to-r from-brand-600 to-brand-500",
        "hover:from-brand-500 hover:to-brand-400 hover:shadow-md hover:shadow-brand-950/40",
        "active:scale-[0.98]",
        className,
      )}
    >
      {/* Subtle hover shine animation */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

      <div className="flex items-center justify-between gap-2">
        {/* Left: Icon + Balance */}
        <div className="flex items-center gap-2 min-w-0">
          <Wallet size={16} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-100 leading-none">
              Balance
            </p>
            <p className="font-mono text-base font-bold text-white leading-tight mt-0.5 truncate">
              {paisaToInr(wallet.balance)}
            </p>
          </div>
        </div>

        {/* Right: Low balance alert badge */}
        {isLowBalance && (
          <span className="flex items-center gap-0.5 rounded-full bg-amber-400/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-200 shrink-0">
            <AlertTriangle size={9} />
            Low
          </span>
        )}
      </div>
    </button>
  );
}
