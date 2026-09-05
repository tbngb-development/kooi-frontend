"use client";

import { useState } from "react";
import {
  useWallet,
  useWalletTransactions,
  useSetWalletThreshold,
} from "@/hooks/useWallet";
import { useMyPlan } from "@/hooks/usePlans";
import { RechargeSlabs } from "@/components/wallet/RechargeSlabs";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { paisaToInr } from "@/constants/config/wallet.config";
import { CreditCard, History, AlertTriangle } from "lucide-react";
import type { WalletTxType } from "@/types/wallet";

const txVariants: Record<
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
  const setThresholdMutation = useSetWalletThreshold();

  const [thresholdInr, setThresholdInr] = useState("");

  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdPaisa = parseFloat(thresholdInr) * 100;
    if (Number.isNaN(thresholdPaisa) || thresholdPaisa < 0) return;
    setThresholdMutation.mutate(thresholdPaisa);
  };

  if (isWalletLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Spinner className="text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance widget */}
        <div className="md:col-span-2">
          <WalletBalance />
        </div>

        {/* Current Plan Specification */}
        {tenantPlan && (
          <Card className="p-4 border-surface-border bg-surface flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-text-placeholder uppercase tracking-wider">
                Current Active Plan
              </p>
              <h4 className="text-lg font-bold text-text-primary mt-1">
                {tenantPlan.plan.name}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Rate: {paisaToInr(tenantPlan.plan.perMinuteRate)}/min
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-subtle flex items-center justify-between">
              <Badge variant="success" dot>
                Active
              </Badge>
              <span className="text-[10px] font-bold text-text-placeholder uppercase font-mono">
                Pulsed: Every {tenantPlan.plan.billingIncrementSec}s
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* Manual Recharge Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <CreditCard size={15} />
          Add Wallet Balance
        </h3>
        <RechargeSlabs />
      </div>

      {/* Threshold Configurator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-warning-500" />
              Low Balance Notifications
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Define a low balance threshold. We will automatically alert
              administrators via email once your balance falls below this limit.
            </p>
          </div>
          <form
            onSubmit={handleUpdateThreshold}
            className="flex gap-2 items-end mt-4"
          >
            <div className="flex-1">
              <Input
                type="number"
                label="Alert Threshold (INR)"
                placeholder={
                  wallet?.lowBalanceThreshold
                    ? (wallet.lowBalanceThreshold / 100).toString()
                    : "0"
                }
                value={thresholdInr}
                onChange={(e) => setThresholdInr(e.target.value)}
                className="h-9"
              />
            </div>
            <Button
              size="sm"
              type="submit"
              loading={setThresholdMutation.isPending}
              className="h-9"
            >
              Save
            </Button>
          </form>
        </Card>
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <History size={15} />
          Transaction History 
        </h3>

        <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
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
                    {txPage.items.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-surface-muted/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <Badge variant={txVariants[tx.type]}>{tx.type}</Badge>
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
                    ))}
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
      </div>
    </div>
  );
}
