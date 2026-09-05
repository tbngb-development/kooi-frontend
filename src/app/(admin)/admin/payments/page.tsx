"use client";

import {
  useAdminPayments,
  useAdminPaymentsSummary,
} from "@/hooks/admin/useAdminPayments";
import { usePagination } from "@/hooks/usePagination";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { paisaToInr } from "@/constants/config/wallet.config";
import {
  Banknote,
  CreditCard,
  Sparkles,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function AdminGlobalPaymentsPage() {
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useAdminPaymentsSummary();

  const {
    data: payPage,
    isLoading: isTableLoading,
    isFetching: isTableFetching,
    refetch: refetchTable,
  } = useAdminPayments({ page, limit });

  const handleRefresh = () => {
    refetchSummary();
    refetchTable();
  };

  const mCards = [
    {
      title: "Total Platform Revenue",
      value: summary ? paisaToInr(summary.totalRevenue || 0) : "—",
      icon: Banknote,
      color: "text-brand-600 bg-brand-50 border-brand-100",
    },
    {
      title: "30-Day MRR Approx",
      value: summary ? paisaToInr(summary.mrrApprox || 0) : "—",
      icon: TrendingUp,
      color: "text-secondary-600 bg-secondary-50 border-secondary-100",
    },
    {
      title: "Completed recharges",
      value: summary?.successCount ?? 0,
      icon: Sparkles,
      color: "text-success-600 bg-success-50 border-success-100",
    },
    {
      title: "Failed payments",
      value: summary?.failedCount ?? 0,
      icon: AlertCircle,
      color: "text-error-600 bg-error-50 border-error-100",
    },
  ];

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Payments & Revenue
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Platform-wide monetization control and subscription ledger analysis.
          </p>
        </div>
        <div className="flex items-center shrink-0">
          <RefreshButton
            onRefresh={handleRefresh}
            isRefreshing={isSummaryFetching || isTableFetching}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="p-4 flex items-start gap-3">
              <div
                className={`h-10 w-10 border rounded-lg flex items-center justify-center shrink-0 ${card.color}`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                  {card.title}
                </p>
                <h3 className="text-lg font-bold text-text-primary tracking-tight mt-0.5">
                  {isSummaryLoading ? (
                    <span className="inline-block w-20 h-5 bg-surface-subtle animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </h3>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Unified Payments Catalog Table */}
      <Card className="overflow-hidden border border-surface-border bg-surface rounded-xl">
        {isTableLoading && page === 1 ? (
          <div className="p-12 flex justify-center">
            <Spinner className="text-error-600" />
          </div>
        ) : !payPage?.items || payPage.items.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={24} />}
            title="No global transactions mapped"
            description="All platform recharges and system onboarding transactions will populate down here."
          />
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                  <th className="px-5 py-3">Payment ID</th>
                  <th className="px-5 py-3">Tenant Workspace</th>
                  <th className="px-5 py-3">Billing Slabs</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                {payPage.items.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-text-placeholder">
                      {pay.id}
                    </td>
                    <td className="px-5 py-4 font-semibold text-text-secondary">
                      {pay.tenantName ?? "Workspace"}
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-700">
                      {paisaToInr(pay.amount || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={pay.status === "SUCCESS" ? "success" : "error"}
                        dot
                      >
                        {pay.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted text-right">
                      {pay.createdAt
                        ? new Date(pay.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payPage.total > limit && (
              <div className="p-4 border-t border-surface-border">
                <Pagination
                  page={page}
                  totalPages={Math.ceil(payPage.total / limit)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
