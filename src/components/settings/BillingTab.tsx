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
import { ArrowUpCircle, History, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TX_VARIANTS: Record<
  WalletTxType,
  "success" | "error" | "blue" | "gray" | "purple"
> = {
  CREDIT: "success",
  DEBIT: "error",
  REFUND: "blue",
  BONUS: "purple",
  ADJUSTMENT: "gray",
};

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

  return (
    <div className="space-y-6">
      {/* Current Active Plan Card */}
      {tenantPlan && (
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-text-placeholder uppercase tracking-wider">
                Current Active Plan
              </p>
              <h4 className="text-xl font-bold text-text-primary mt-1 capitalize">
                {tenantPlan.plan.name}
              </h4>
              <p className="text-sm text-text-muted mt-0.5">
                Rate:{" "}
                {tenantPlan.plan.pricingModel === "CUSTOM"
                  ? "Custom"
                  : `${paisaToInr(tenantPlan.plan.perMinuteRate)} / min`}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <AlertTriangle size={12} className="text-amber-500" />
                <span>
                  Low balance alert configured at{" "}
                  <strong className="text-text-primary font-mono">
                    {paisaToInr(tenantPlan.plan.lowBalanceThreshold)}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <Badge variant="success" dot>
                Active
              </Badge>
              {wallet && (
                <span className="text-xs text-text-muted font-mono">
                  Balance: {paisaToInr(wallet.balance)}
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
                      <th className="px-5 py-3 text-right">Balance Post</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                    {txPage.items.map((tx: WalletTransaction) => {
                      const badgeVariant = TX_VARIANTS[tx.type] ?? "gray";

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-surface-muted/50 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <Badge variant={badgeVariant}>{tx.type}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-text-secondary max-w-[200px] truncate">
                            {tx.description}
                          </td>
                          <td
                            className={`px-5 py-3.5 text-right font-mono font-bold ${
                              tx.type === "DEBIT"
                                ? "text-error-600"
                                : "text-success-600"
                            }`}
                          >
                            {tx.type === "DEBIT" ? "-" : "+"}
                            {paisaToInr(tx.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-xs text-text-muted">
                            {paisaToInr(tx.balanceAfter)}
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
                  totalPages={Math.ceil(txPage.total / txPage.limit)}
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
