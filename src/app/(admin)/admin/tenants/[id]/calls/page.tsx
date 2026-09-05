"use client";

import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import { useAdminCalls } from "@/hooks/admin/useAdminCalls";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { FilterBar, FilterSelect } from "@/components/ui/FilterBar";
import { PhoneCall, ExternalLink } from "lucide-react";
import Link from "next/link";
import { paisaToInr } from "@/constants/config/wallet.config";

const statusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Calling", value: "CALLING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "No Answer", value: "NO_ANSWER" },
  { label: "Busy", value: "BUSY" },
];
const tempOptions = [
  { label: "Hot", value: "HOT" },
  { label: "Warm", value: "WARM" },
  { label: "Nurture", value: "NURTURE" },
  { label: "Cold", value: "COLD" },
];
const statusVariant: Record<
  string,
  "gray" | "info" | "success" | "error" | "warning" | "default"
> = {
  PENDING: "gray",
  CALLING: "info",
  COMPLETED: "success",
  FAILED: "error",
  NO_ANSWER: "warning",
  BUSY: "default",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenantCallsPage({ params }: PageProps) {
  const { id: tenantId } = use(params);
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [temperature, setTemperature] = useState("");

  const { data: tenant } = useTenant(tenantId);
  const { data, isLoading, isFetching } = useAdminCalls({
    tenantId,
    page,
    limit: 20,
    status: status || undefined,
    leadTemperature: temperature || undefined,
  });

  const calls = data?.calls ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title="Calls"
          description={
            pagination ? `${pagination.total} total calls` : undefined
          }
          backHref={ADMIN_ROUTES.TENANT_DETAIL(tenantId)}
          onRefresh={() =>
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.ADMIN_CALLS.all(tenantId),
            })
          }
          isRefreshing={isFetching}
        />

        <FilterBar
          hasActiveFilters={!!status || !!temperature}
          onReset={() => {
            setStatus("");
            setTemperature("");
            setPage(1);
          }}
        >
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={statusOptions}
          />
          <FilterSelect
            label="Temperature"
            value={temperature}
            onChange={(v) => {
              setTemperature(v);
              setPage(1);
            }}
            options={tempOptions}
          />
        </FilterBar>

        <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Spinner className="text-error-600" />
            </div>
          ) : calls.length === 0 ? (
            <EmptyState icon={<PhoneCall size={24} />} title="No calls found" />
          ) : (
            <>
              <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                      <th className="px-5 py-3">Call ID</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Lead</th>
                      <th className="px-5 py-3 text-right">Duration</th>
                      <th className="px-5 py-3 text-right">Cost</th>
                      <th className="px-5 py-3">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                    {calls.map((call) => (
                      <tr
                        key={call.id}
                        className="hover:bg-surface-muted/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={ADMIN_ROUTES.TENANT_CALL_DETAIL(
                              tenantId,
                              call.id,
                            )}
                            className="font-mono text-xs hover:text-error-600 transition-colors inline-flex items-center gap-1"
                          >
                            {call.id.slice(0, 12)}...{" "}
                            <ExternalLink
                              size={10}
                              className="text-text-placeholder"
                            />
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            variant={statusVariant[call.status] ?? "default"}
                            dot={call.status === "CALLING"}
                            animate={call.status === "CALLING"}
                          >
                            {call.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-xs text-text-secondary">
                          {call.lead?.name ?? call.lead?.phone ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-right font-mono">
                          {call.duration ? `${call.duration}s` : "—"}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-semibold">
                          {call.platformCost
                            ? paisaToInr(call.platformCost)
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-xs text-text-muted">
                          {call.startedAt
                            ? new Date(call.startedAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && (
                <div className="p-4 border-t border-surface-border">
                  <Pagination
                    page={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
