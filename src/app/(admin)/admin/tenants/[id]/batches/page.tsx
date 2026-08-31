"use client";

import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import { useAdminCampaigns } from "@/hooks/admin/useAdminCampaigns";
import { useAdminBatches } from "@/hooks/admin/useAdminBatches";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Layers, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

const batchStatusVariant: Record<
  string,
  "gray" | "info" | "success" | "error" | "warning" | "purple"
> = {
  CREATED: "gray",
  SCHEDULED: "purple",
  RUNNING: "info",
  STOPPED: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenantBatchesPage({ params }: PageProps) {
  const { id: tenantId } = use(params);
  const qc = useQueryClient();

  const { data: tenant } = useTenant(tenantId);
  const { data: campaigns } = useAdminCampaigns(tenantId);
  const [selectedCampaign, setSelectedCampaign] = useState("");

  const {
    data: batches,
    isLoading,
    isFetching,
  } = useAdminBatches(tenantId, selectedCampaign);

  const campaignOptions =
    campaigns?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const completedCount =
    batches?.filter((b) => b.status === "COMPLETED").length ?? 0;
  const runningCount =
    batches?.filter((b) => b.status === "RUNNING").length ?? 0;
  const failedCount = batches?.filter((b) => b.status === "FAILED").length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title="Batches"
          description="Batch execution sequences grouped by campaign"
          backHref={ADMIN_ROUTES.TENANT_DETAIL(tenantId)}
          onRefresh={() => {
            if (selectedCampaign) {
              qc.invalidateQueries({
                queryKey: QUERY_KEYS.ADMIN_BATCHES.all(
                  tenantId,
                  selectedCampaign,
                ),
              });
            }
          }}
          isRefreshing={isFetching}
        />

        <div className="max-w-xs">
          <Select
            label="Select Campaign"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            options={campaignOptions}
            placeholder="Choose a campaign..."
          />
        </div>

        {!selectedCampaign ? (
          <Card className="p-12">
            <EmptyState
              icon={<Layers size={24} />}
              title="Select a campaign"
              description="Choose a campaign above to view its batch execution history."
            />
          </Card>
        ) : (
          <>
            {/* Batch Summary */}
            {batches && batches.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-3">
                  <Layers size={18} className="text-text-muted shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                      Total Batches
                    </p>
                    <h3 className="text-lg font-bold text-text-primary">
                      {batches.length}
                    </h3>
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    className="text-success-600 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                      Completed
                    </p>
                    <h3 className="text-lg font-bold text-success-600">
                      {completedCount}
                    </h3>
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                  <Clock size={18} className="text-info-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                      Running
                    </p>
                    <h3 className="text-lg font-bold text-info-600">
                      {runningCount}
                    </h3>
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                  <XCircle size={18} className="text-error-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                      Failed
                    </p>
                    <h3 className="text-lg font-bold text-error-600">
                      {failedCount}
                    </h3>
                  </div>
                </Card>
              </div>
            )}

            {/* Batch Table */}
            <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <Spinner className="text-error-600" />
                </div>
              ) : !batches || batches.length === 0 ? (
                <EmptyState
                  icon={<Layers size={24} />}
                  title="No batches found"
                  description="This campaign has no batch sequences yet."
                />
              ) : (
                <div className="overflow-x-auto thin-scrollbar">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                        <th className="px-5 py-3">Batch ID</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Source File</th>
                        <th className="px-5 py-3 text-right">Total Leads</th>
                        <th className="px-5 py-3 text-right">Called</th>
                        <th className="px-5 py-3 text-right">Completed</th>
                        <th className="px-5 py-3 text-right">Failed</th>
                        <th className="px-5 py-3">Scheduled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                      {batches.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-surface-muted/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <p className="font-mono text-xs text-text-muted">
                              {b.id.slice(0, 12)}...
                            </p>
                            {b.bolnaBatchId && (
                              <p className="font-mono text-[10px] text-text-placeholder mt-0.5">
                                Bolna: {b.bolnaBatchId.slice(0, 10)}...
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                batchStatusVariant[b.status] ?? "default"
                              }
                              dot={b.status === "RUNNING"}
                              animate={b.status === "RUNNING"}
                            >
                              {b.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <FileText
                                size={13}
                                className="text-text-muted shrink-0"
                              />
                              <span className="text-xs text-text-secondary truncate max-w-[140px]">
                                {b.fileName ?? "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-mono">
                            {b.totalLeads}
                          </td>
                          <td className="px-5 py-4 text-right font-mono">
                            {b.calledLeads}
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-success-600">
                            {b.completedLeads}
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-error-600">
                            {b.failedLeads}
                          </td>
                          <td className="px-5 py-4 text-xs text-text-muted">
                            {b.scheduledAt
                              ? new Date(b.scheduledAt).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
