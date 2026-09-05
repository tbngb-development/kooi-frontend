"use client";

import { use, useState } from "react";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import {
  useAdminWallet,
  useAdminWalletTransactions,
  useAdjustWallet,
} from "@/hooks/admin/useAdminWallet";
import { usePagination } from "@/hooks/usePagination";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { paisaToInr } from "@/constants/config/wallet.config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  History,
} from "lucide-react";
import type { WalletTxType, WalletAdjustmentType } from "@/types/wallet";

const adjustSchema = z.object({
  amountRupees: z.number().positive("Amount must be greater than zero"),
  type: z.enum(["CREDIT", "DEBIT", "BONUS"] as const),
  description: z.string().min(3, "Reason requires at least 3 characters"),
});

type AdjustFormValues = z.infer<typeof adjustSchema>;

const typeVariants: Record<
  WalletTxType,
  "success" | "error" | "purple" | "gray" | "default"
> = {
  CREDIT: "success",
  DEBIT: "error",
  REFUND: "success",
  BONUS: "purple",
  ADJUSTMENT: "gray",
};

export default function TenantWalletPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tenantId } = use(params);
  const { data: tenant, isLoading: isTenantLoading } = useTenant(tenantId);
  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = useAdminWallet(tenantId);

  const { page, limit, setPage } = usePagination({ initialLimit: 15 });
  const {
    data: txPage,
    isLoading: isTxLoading,
    refetch: refetchTx,
  } = useAdminWalletTransactions(tenantId, page, limit);

  const adjustMutation = useAdjustWallet();
  const [showAdjust, setShowAdjust] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { amountRupees: 100, type: "CREDIT", description: "" },
  });

  const onAdjust = (values: AdjustFormValues) => {
    adjustMutation.mutate(
      {
        tenantId,
        amountPaisa: Math.round(values.amountRupees * 100),
        type: values.type,
        description: values.description,
      },
      {
        onSuccess: () => {
          setShowAdjust(false);
          reset();
        },
      },
    );
  };

  const handleRefresh = () => {
    refetchWallet();
    refetchTx();
  };

  if (isTenantLoading || isWalletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-error-600" />
      </div>
    );
  }

  if (!tenant || !wallet) {
    return (
      <div className="p-8 text-center text-text-muted">
        Tenant data could not be retrieved.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant.name} />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title="Wallet Ledger"
          description={`Control and audit funds for ${tenant.name}`}
          backHref={`/admin/tenants/${tenantId}`}
          onRefresh={handleRefresh}
          isRefreshing={isTxLoading}
          actions={
            <Button
              onClick={() => setShowAdjust(true)}
              className="gap-1.5 h-9 text-sm"
            >
              <Plus size={14} /> Adjust Wallet
            </Button>
          }
        />

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="p-5 flex items-start justify-between border border-surface-border">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-text-placeholder">
                Principal Cash Balance
              </span>
              <h2 className="text-3xl font-bold font-mono tracking-tight text-text-primary">
                {paisaToInr(wallet.balance)}
              </h2>
            </div>
            <div className="h-10 w-10 border border-success-100 bg-success-50 rounded-lg flex items-center justify-center text-success-600 shrink-0">
              <ArrowUpRight size={18} />
            </div>
          </Card>

          <Card className="p-5 flex items-start justify-between border border-surface-border">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-text-placeholder">
                Promotional Bonus Balance
              </span>
              <h2 className="text-3xl font-bold font-mono tracking-tight text-secondary-700">
                {paisaToInr(wallet.bonusBalance)}
              </h2>
            </div>
            <div className="h-10 w-10 border border-secondary-100 bg-secondary-50 rounded-lg flex items-center justify-center text-secondary-600 shrink-0">
              <ArrowDownLeft size={18} />
            </div>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
          <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
            <h3 className="font-bold text-text-primary flex items-center gap-2 text-sm uppercase tracking-wider">
              <History size={15} className="text-text-placeholder" />{" "}
              Transaction History
            </h3>
          </div>

          {isTxLoading && page === 1 ? (
            <div className="p-12 flex justify-center">
              <Spinner className="text-error-600" />
            </div>
          ) : !txPage?.items || txPage.items.length === 0 ? (
            <EmptyState
              icon={<WalletIcon size={24} />}
              title="No transactions recorded"
              description="This tenant workspace has not processed any balance adjustment or recharge actions."
            />
          ) : (
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                    <th className="px-5 py-3">Tx ID</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Closing Balance</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                  {txPage.items.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-text-placeholder">
                        {tx.id.slice(0, 14)}...
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={typeVariants[tx.type]} dot>
                          {tx.type}
                        </Badge>
                      </td>
                      <td
                        className={`px-5 py-4 font-mono font-bold ${
                          tx.type === "DEBIT"
                            ? "text-error-600"
                            : "text-success-600"
                        }`}
                      >
                        {tx.type === "DEBIT" ? "-" : "+"}
                        {paisaToInr(tx.amount)}
                      </td>
                      <td className="px-5 py-4 font-mono text-text-secondary text-xs">
                        {paisaToInr(tx.balanceAfter)}
                      </td>
                      <td className="px-5 py-4 text-text-secondary max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="px-5 py-4 text-xs text-text-muted text-right">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {txPage.total > limit && (
                <div className="p-4 border-t border-surface-border">
                  <Pagination
                    page={page}
                    totalPages={Math.ceil(txPage.total / limit)}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Adjust Wallet Dialog */}
      <Modal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
        title="Adjust Wallet Balance"
        size="md"
      >
        <form onSubmit={handleSubmit(onAdjust)} className="space-y-4">
          <Input
            label="Adjustment Amount (₹)"
            type="number"
            step="0.01"
            error={errors.amountRupees?.message}
            {...register("amountRupees", { valueAsNumber: true })}
            placeholder="1500.00"
          />
          <Select
            label="Transaction Variant Type"
            error={errors.type?.message}
            options={[
              { value: "CREDIT", label: "CREDIT (Add cash to balance)" },
              { value: "DEBIT", label: "DEBIT (Deduct from balance)" },
              { value: "BONUS", label: "BONUS (Promotional credits)" },
            ]}
            {...register("type")}
          />
          <Input
            label="Adjustment Reason / Description"
            error={errors.description?.message}
            {...register("description")}
            placeholder="Manual onboarding slab compensation adjustment"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowAdjust(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={adjustMutation.isPending}>
              Apply Wallet Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
