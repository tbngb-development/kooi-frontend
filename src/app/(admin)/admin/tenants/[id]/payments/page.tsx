"use client";

import { use } from "react";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import { useAdminPayments } from "@/hooks/admin/useAdminPayments";
import { usePagination } from "@/hooks/usePagination";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { paisaToInr } from "@/constants/config/wallet.config";
import { CreditCard } from "lucide-react";

export default function TenantPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tenantId } = use(params);
  const { data: tenant, isLoading: isTenantLoading } = useTenant(tenantId);
  const { page, limit, setPage } = usePagination({ initialLimit: 15 });
  const {
    data: payPage,
    isLoading: isPayLoading,
    refetch,
  } = useAdminPayments({
    tenantId,
    page,
    limit,
  });

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
        <AdminPageHeader
          title="Payment History"
          description={`Billing receipts and invoices for ${tenant.name}`}
          backHref={`/admin/tenants/${tenantId}`}
          onRefresh={refetch}
          isRefreshing={isPayLoading}
        />

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
                    <th className="px-5 py-3">Billing Slabs</th>
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
                      <td className="px-5 py-4 font-semibold text-brand-700">
                        {paisaToInr(pay.amount)}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold uppercase text-text-secondary">
                        {pay.purpose}
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
                      <td className="px-5 py-4 text-xs text-text-muted text-right">
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
