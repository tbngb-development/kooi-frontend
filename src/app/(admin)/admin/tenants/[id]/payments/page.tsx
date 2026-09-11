"use client";

import { use } from "react";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import {
  useAdminPayments,
  useAdminPaymentSummary,
  useActivateFreePlan,
} from "@/hooks/admin/useAdminPayments";
import { usePagination } from "@/hooks/usePagination";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { paisaToInr } from "@/lib/utils/formatMoney";
import {
  CreditCard,
  Banknote,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function TenantPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tenantId } = use(params);
  const {
    data: tenant,
    isLoading: isTenantLoading,
    refetch: refetchTenant,
  } = useTenant(tenantId);
  const { page, limit, setPage } = usePagination({ initialLimit: 15 });

  // Fetch per-tenant payment summary metrics
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useAdminPaymentSummary(tenantId);

  // Fetch tenant payment transactions
  const {
    data: payPage,
    isLoading: isPayLoading,
    refetch: refetchTable,
  } = useAdminPayments({
    tenantId,
    page,
    limit,
  });

  const { mutate: activateFree, isPending: isActivating } =
    useActivateFreePlan();

  const handleRefresh = () => {
    refetchTenant();
    refetchSummary();
    refetchTable();
  };

  const handleActivateFree = () => {
    if (
      confirm(
        "This will activate the plan for this Enterprise workspace without payment. Continue?",
      )
    ) {
      activateFree(tenantId, {
        onSuccess: () => handleRefresh(),
      });
    }
  };

  if (isTenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-error-600" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-text-muted">
        Tenant data not resolved.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant.name} />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AdminPageHeader
            title="Payment History"
            description={`Billing receipts, top-ups, and ledger for ${tenant.name}`}
            backHref={`/admin/tenants/${tenantId}`}
            onRefresh={handleRefresh}
            isRefreshing={isPayLoading || isSummaryLoading}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleActivateFree}
              loading={isActivating}
              leftIcon={<ShieldCheck size={14} />}
              className="border-brand-600 text-brand-700 hover:bg-brand-50"
            >
              Activate Plan (Free)
            </Button>
          </div>
        </div>

        {/* Ledger Metrics Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 border border-brand-100 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center shrink-0">
              <Banknote size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                Total Revenue Settled
              </p>
              <h3 className="text-lg font-bold text-text-primary font-mono tracking-tight mt-0.5">
                {isSummaryLoading
                  ? "—"
                  : paisaToInr(summary?.totalAmountPaisa ?? 0)}
              </h3>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 border border-success-100 bg-success-50 text-success-600 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                Successful Payments
              </p>
              <h3 className="text-lg font-bold text-text-primary mt-0.5">
                {isSummaryLoading ? "—" : (summary?.successfulRecharges ?? 0)}
              </h3>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 border border-error-100 bg-error-50 text-error-600 rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                Failed Payments
              </p>
              <h3 className="text-lg font-bold text-text-primary mt-0.5">
                {isSummaryLoading ? "—" : (summary?.failedRecharges ?? 0)}
              </h3>
            </div>
          </Card>
        </div>

        {/* Ledger Datatable */}
        <Card className="overflow-hidden border border-surface-border bg-surface rounded-xl">
          {isPayLoading && page === 1 ? (
            <div className="p-12 flex justify-center">
              <Spinner className="text-error-600" />
            </div>
          ) : !payPage?.items || payPage.items.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={24} />}
              title="No payments made"
              description="No financial payment records were found for this workspace."
            />
          ) : (
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                    <th className="px-5 py-3">Receipt ID</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Purpose</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Settled On</th>
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
                      <td className="px-5 py-4 font-bold text-brand-700 font-mono">
                        {paisaToInr(pay.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            pay.purpose === "ONBOARDING" ? "purple" : "blue"
                          }
                        >
                          {pay.purpose === "ONBOARDING"
                            ? "Onboarding"
                            : "Topup"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            pay.status === "SUCCESS" ? "success" : "error"
                          }
                          dot
                        >
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-text-muted text-right font-mono">
                        {new Date(pay.createdAt).toLocaleString()}
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
    </div>
  );
}
