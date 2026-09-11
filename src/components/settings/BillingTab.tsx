"use client";

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
import type { WalletTransaction, WalletTxType } from "@/types/wallet";
import {
  ArrowUpCircle,
  History,
  AlertTriangle,
  Clock,
  PhoneCall,
  Gift,
  Wrench,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

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
  ADJUSTMENT: "Admin Adjustment",
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
  const { data: tenantPlan } = useMyPlan();
  const { data: txPage, isLoading: isTxLoading } = useWalletTransactions(
    page,
    10,
  );

  const { user, memberships, activeTenantId } = useAuthStore();
  const activeRole = memberships.find(
    (m) => m.tenantId === activeTenantId,
  )?.role;
  const canManagePlan = activeRole === "OWNER" || !!user?.isPlatformAdmin;

  if (isWalletLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Spinner className="text-brand-600" />
      </div>
    );
  }

  const terms = tenantPlan?.effectiveTerms;

  return (
    <div className="space-y-6">
      {/* Current Active Plan Card */}
      {tenantPlan && terms && (
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-text-placeholder uppercase tracking-wider">
                Current Active Plan
              </p>
              <div className="flex items-center gap-2 mt-1">
                <h4 className="text-xl font-bold text-text-primary capitalize">
                  {terms.planName}
                </h4>
                {terms.isCustomPriced && (
                  <Badge variant="purple">Custom Pricing</Badge>
                )}
              </div>
              <p className="text-sm text-text-muted mt-0.5">
                Rate:{" "}
                {terms.pricingModel === "CUSTOM"
                  ? "Custom"
                  : `${paisaToInr(terms.perMinuteRate)} / min`}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <AlertTriangle size={12} className="text-amber-500" />
                <span>
                  Low balance alert configured at{" "}
                  <strong className="text-text-primary font-mono">
                    {paisaToInr(terms.lowBalanceThreshold)}
                  </strong>
                </span>
              </div>
              {/* Bonus expiry */}
              {tenantPlan.bonusExpiresAt && (
                <BonusExpiryBadge expiresAt={tenantPlan.bonusExpiresAt} />
              )}
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <Badge variant="success" dot>
                {tenantPlan.status}
              </Badge>
              {wallet && (
                <span className="text-xs text-text-muted font-mono">
                  Balance: {paisaToInr(wallet.totalBalance)}
                </span>
              )}
              {canManagePlan && (
                <Link href={APP_ROUTES.PLANS}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowUpCircle size={14} />}
                    className="mt-1"
                  >
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Transaction History Ledger */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <History size={15} />
          Transaction History
        </h3>

        <Card padding="none" className="overflow-hidden">
          {isTxLoading ? (
            <div className="p-12 flex justify-center">
              <Spinner className="text-brand-600" />
            </div>
          ) : !txPage || txPage.items.length === 0 ? (
            <EmptyState
              icon={<History size={24} />}
              title="No transactions recorded"
              description="Your ledger is currently empty."
            />
          ) : (
            <>
              <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-right">Cash After</th>
                      <th className="px-5 py-3 text-right">Bonus After</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                    {txPage.items.map((tx: WalletTransaction) => {
                      const badgeVariant = TX_VARIANTS[tx.type] ?? "gray";
                      const label = TX_LABELS[tx.type] ?? tx.type;
                      const SourceIcon = tx.sourceType
                        ? TX_ICONS[tx.sourceType]
                        : null;

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-surface-muted/50 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {SourceIcon && (
                                <SourceIcon
                                  size={13}
                                  className="text-text-placeholder"
                                />
                              )}
                              <Badge variant={badgeVariant}>{label}</Badge>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-text-secondary max-w-[200px] truncate">
                            {tx.description}
                          </td>
                          <td
                            className={cn(
                              "px-5 py-3.5 text-right font-mono font-bold",
                              tx.cashDelta < 0 || tx.bonusDelta < 0
                                ? "text-error-600"
                                : "text-success-600",
                            )}
                          >
                            {tx.cashDelta < 0 || tx.bonusDelta < 0 ? "-" : "+"}
                            {paisaToInr(tx.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-xs text-text-muted">
                            {paisaToInr(tx.cashBalanceAfter)}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-xs text-text-muted">
                            {tx.bonusBalanceAfter > 0
                              ? paisaToInr(tx.bonusBalanceAfter)
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-text-placeholder">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-surface-border">
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
        "inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded",
        isUrgent
          ? "text-warning-700 bg-warning-50 border border-warning-200"
          : "text-secondary-600 bg-secondary-50 border border-secondary-100",
      )}
    >
      <Clock size={10} />
      Bonus expires{" "}
      {new Date(expiresAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
      {isUrgent && ` (${diffDays}d left)`}
    </div>
  );
}
