"use client";

import { useState } from "react";
import Link from "next/link";
import {
  History,
  AlertTriangle,
  Clock,
  PhoneCall,
  Gift,
  Wrench,
  RotateCcw,
  CreditCard,
  Wallet,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { paisaToInr } from "@/constants/config/wallet.config";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { useMyPlan } from "@/hooks/usePlans";
import { useWallet, useWalletTransactions } from "@/hooks/useWallet";
import { useAuthStore } from "@/store/authStore";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";
import type { WalletTransaction, WalletTxType } from "@/types/wallet";

// ── Transaction type → visual mapping ────────────────────────────────────────

const TX_VARIANTS: Record<
  WalletTxType,
  "success" | "error" | "blue" | "gray" | "purple" | "orange"
> = {
  CREDIT: "success",
  DEBIT: "error",
  REFUND: "blue",
  BONUS: "purple",
  BONUS_EXPIRY: "orange",
  ADJUSTMENT: "gray",
};

const TX_LABELS: Record<WalletTxType, string> = {
  CREDIT: "Recharge",
  DEBIT: "Call Charge",
  BONUS: "Plan Bonus",
  BONUS_EXPIRY: "Bonus Expired",
  REFUND: "Refund",
  ADJUSTMENT: "Adjustment",
};

const TX_ICONS: Record<string, typeof CreditCard> = {
  RECHARGE: CreditCard,
  CALL: PhoneCall,
  PLAN_BONUS: Gift,
  BONUS_EXPIRY: Clock,
  ADMIN_ADJUSTMENT: Wrench,
  REFUND: RotateCcw,
};

// ── Component ────────────────────────────────────────────────────────────────

export default function BillingTab() {
  const [page, setPage] = useState(1);

  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const { data: tenantPlan, isLoading: isPlanLoading } = useMyPlan();
  const { data: txPage, isLoading: isTxLoading } = useWalletTransactions(
    page,
    10,
  );

  const { user, memberships, activeTenantId } = useAuthStore();
  const activeRole = memberships.find(
    (m) => m.tenantId === activeTenantId,
  )?.role;
  const canManagePlan = activeRole === "OWNER" || !!user?.isPlatformAdmin;

  if (isWalletLoading || isPlanLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner className="text-brand-600 h-8 w-8" />
      </div>
    );
  }

  const terms = tenantPlan?.effectiveTerms;

  return (
    <div className="space-y-6">
      {/* ─── Top Overview Cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Plan Card */}
        {tenantPlan && terms && (
          <Card className="p-5 flex flex-col justify-between shadow-xs border-surface-border">
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={14} /> Active Subscription
                </h3>
                <Badge
                  variant={
                    tenantPlan.status === "ACTIVE" ? "success" : "warning"
                  }
                  dot
                >
                  {tenantPlan.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-extrabold text-text-primary capitalize truncate">
                  {terms.planName}
                </h4>
                {terms.isCustomPriced && (
                  <Badge variant="purple" className="shrink-0">
                    Custom
                  </Badge>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-text-secondary">AI Calling Rate</span>
                  <span className="font-mono text-text-primary font-bold">
                    {terms.pricingModel === "CUSTOM"
                      ? "Custom"
                      : `${paisaToInr(terms.perMinuteRate)} / min`}
                  </span>
                </div>

                {/* User-Centric Min-Balance Alert */}
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    Minimum balance alert
                  </span>
                  <span className="font-mono text-text-primary font-bold">
                    {paisaToInr(terms.lowBalanceThreshold)}
                  </span>
                </div>
              </div>
            </div>

            {canManagePlan && (
              <div className="mt-5 pt-4 border-t border-surface-subtle">
                <Link href={APP_ROUTES.PLANS} className="block w-full">
                  <Button
                    variant="outline"
                    className="w-full font-bold"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Explore & Change Plans
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        )}

        {/* Wallet Balance Card */}
        {wallet && (
          <Card className="p-5 flex flex-col justify-between shadow-xs border-surface-border bg-brand-50/20">
            <div>
              <h3 className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Wallet size={14} /> Workspace Wallet
              </h3>

              <div className="mt-1">
                <p className="text-sm font-bold text-text-secondary mb-1">
                  Available Balance
                </p>
                <p className="text-4xl font-extrabold text-text-primary font-mono tabular-nums tracking-tight">
                  {paisaToInr(wallet.totalBalance)}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="bg-surface border border-surface-border rounded-lg p-3">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Cash Funds
                  </p>
                  <p className="text-lg font-bold font-mono text-text-primary mt-1">
                    {paisaToInr(wallet.cashBalance)}
                  </p>
                </div>
                <div className="bg-surface border border-surface-border rounded-lg p-3">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Bonus Pool
                  </p>
                  <p className="text-lg font-bold font-mono text-brand-600 mt-1">
                    {paisaToInr(wallet.bonusBalance)}
                  </p>
                </div>
              </div>

              {tenantPlan?.bonusExpiresAt && (
                <BonusExpiryBadge expiresAt={tenantPlan.bonusExpiresAt} />
              )}
            </div>
          </Card>
        )}
      </div>

      {/* ─── Transaction History Ledger ─── */}
      <section className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <History size={18} className="text-brand-600" />
          Transactions History
        </h3>

        <Card
          padding="none"
          className="overflow-hidden shadow-xs border-surface-border"
        >
          {isTxLoading ? (
            <div className="p-16 flex justify-center">
              <Spinner className="text-brand-600 h-8 w-8" />
            </div>
          ) : !txPage || txPage.items.length === 0 ? (
            <EmptyState
              icon={<History size={28} className="text-text-placeholder" />}
              title="No transactions recorded"
              description="Your billing and usage ledger is currently empty."
            />
          ) : (
            <>
              <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-subtle">
                      <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                        Type
                      </th>
                      <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                        Description
                      </th>
                      <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                        Cash Bal
                      </th>
                      <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                        Bonus Bal
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {txPage.items.map((tx: WalletTransaction) => {
                      const badgeVariant = TX_VARIANTS[tx.type] ?? "gray";
                      const label = TX_LABELS[tx.type] ?? tx.type;
                      const SourceIcon = tx.sourceType
                        ? TX_ICONS[tx.sourceType]
                        : null;

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-surface-hover/60 transition-colors duration-normal ease-out"
                        >
                          {/* Type */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {SourceIcon && (
                                <SourceIcon
                                  size={14}
                                  className="text-text-placeholder"
                                />
                              )}
                              <Badge
                                variant={badgeVariant}
                                className="uppercase tracking-wider text-[10px]"
                              >
                                {label}
                              </Badge>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-base font-medium text-text-secondary block max-w-[250px] truncate">
                              {tx.description}
                            </span>
                          </td>

                          {/* Amount */}
                          <td
                            className={cn(
                              "px-5 py-4 text-right whitespace-nowrap text-base font-bold font-mono",
                              tx.cashDelta < 0 || tx.bonusDelta < 0
                                ? "text-error-600"
                                : "text-success-600",
                            )}
                          >
                            {tx.cashDelta < 0 || tx.bonusDelta < 0 ? "-" : "+"}
                            {paisaToInr(tx.amount)}
                          </td>

                          {/* Cash After */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <span className="text-sm font-mono font-medium text-text-muted">
                              {paisaToInr(tx.cashBalanceAfter)}
                            </span>
                          </td>

                          {/* Bonus After */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <span className="text-sm font-mono font-medium text-text-muted">
                              {tx.bonusBalanceAfter > 0
                                ? paisaToInr(tx.bonusBalanceAfter)
                                : "—"}
                            </span>
                          </td>

                          {/* Date & Time (Stacked) */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-base font-medium text-text-primary leading-tight">
                                {formatTimeOnly(tx.createdAt)}
                              </span>
                              <span className="text-sm text-text-muted font-medium leading-tight">
                                {formatDateOnly(tx.createdAt)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-surface-border bg-surface-subtle/50">
                <Pagination
                  page={txPage.page}
                  totalPages={txPage.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function BonusExpiryBadge({ expiresAt }: { expiresAt: string }) {
  // eslint-disable-next-line react-hooks/purity
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return null;

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays <= 3;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 mt-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md",
        isUrgent
          ? "text-warning-700 bg-warning-50 border border-warning-200"
          : "text-brand-700 bg-brand-50 border border-brand-200",
      )}
    >
      <Clock size={12} strokeWidth={2.5} />
      Bonus credits expire in {diffDays} day{diffDays === 1 ? "" : "s"}
    </div>
  );
}
