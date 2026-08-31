"use client";

import { use } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import {
  useAdminCampaign,
  useAdminCampaignStats,
  useAdminCampaignPerformance,
} from "@/hooks/admin/useAdminCampaigns";
import { useAdminBatches } from "@/hooks/admin/useAdminBatches";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Users,
  PhoneCall,
  CheckCircle,
  XCircle,
  TrendingUp,
  Layers,
} from "lucide-react";

const statusVariant: Record<string, "gray" | "info" | "success" | "error"> = {
  DRAFT: "gray",
  RUNNING: "info",
  COMPLETED: "success",
  FAILED: "error",
};
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
  params: Promise<{ id: string; campId: string }>;
}

export default function AdminCampaignDetailPage({ params }: PageProps) {
  const { id: tenantId, campId } = use(params);
  const qc = useQueryClient();

  const { data: tenant } = useTenant(tenantId);
  const {
    data: campaign,
    isLoading,
    isFetching,
  } = useAdminCampaign(tenantId, campId);
  const { data: stats } = useAdminCampaignStats(tenantId, campId);
  const { data: performance } = useAdminCampaignPerformance(tenantId, campId);
  const { data: batches } = useAdminBatches(tenantId, campId);

  const handleRefresh = () => {
    qc.invalidateQueries({
      queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS.detail(tenantId, campId),
    });
    qc.invalidateQueries({
      queryKey: QUERY_KEYS.ADMIN_BATCHES.all(tenantId, campId),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-error-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center text-text-muted">Campaign not found.</div>
    );
  }

  const perfCards = performance
    ? [
        {
          label: "Hot Leads",
          value: performance.hotLeads,
          color: "text-error-600",
        },
        {
          label: "Callbacks",
          value: performance.callbacks,
          color: "text-warning-600",
        },
        {
          label: "Site Visits",
          value: performance.siteVisits,
          color: "text-brand-600",
        },
        { label: "DNC", value: performance.dnc, color: "text-text-muted" },
        {
          label: "Qualification Rate",
          value: `${performance.qualificationRate}%`,
          color: "text-info-600",
        },
        {
          label: "Cost/Lead",
          value: `$${performance.costPerLead.toFixed(2)}`,
          color: "text-secondary-600",
        },
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title={campaign.name}
          description={campaign.description ?? undefined}
          backHref={ADMIN_ROUTES.TENANT_CAMPAIGNS(tenantId)}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />

        <div className="flex items-center gap-3">
          <Badge
            variant={statusVariant[campaign.status] ?? "default"}
            dot={campaign.status === "RUNNING"}
            animate={campaign.status === "RUNNING"}
          >
            {campaign.status}
          </Badge>
          {campaign.assistant && (
            <span className="text-xs text-text-muted">
              Agent:{" "}
              <strong className="text-text-secondary">
                {campaign.assistant.name}
              </strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Leads",
              value: campaign.totalLeads,
              icon: Users,
              color: "text-info-600 bg-info-50 border-info-100",
            },
            {
              label: "Called",
              value: campaign.calledLeads,
              icon: PhoneCall,
              color: "text-brand-600 bg-brand-50 border-brand-100",
            },
            {
              label: "Completed",
              value: campaign.completedLeads,
              icon: CheckCircle,
              color: "text-success-600 bg-success-50 border-success-100",
            },
            {
              label: "Failed",
              value: campaign.failedLeads,
              icon: XCircle,
              color: "text-error-600 bg-error-50 border-error-100",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-4 flex items-start gap-3">
                <div
                  className={`h-10 w-10 border rounded-lg flex items-center justify-center shrink-0 ${s.color}`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                    {s.label}
                  </p>
                  <h3 className="text-lg font-bold text-text-primary">
                    {s.value}
                  </h3>
                </div>
              </Card>
            );
          })}
        </div>

        {performance && (
          <>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <TrendingUp size={16} /> Performance
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              {perfCards.map((p, i) => (
                <Card key={i} className="p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                    {p.label}
                  </p>
                  <h4 className={`text-lg font-bold mt-1 ${p.color}`}>
                    {p.value}
                  </h4>
                </Card>
              ))}
            </div>
          </>
        )}

        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Layers size={16} /> Batches
        </h2>
        <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
          {!batches || batches.length === 0 ? (
            <EmptyState
              icon={<Layers size={24} />}
              title="No batches"
              description="This campaign has no batches yet."
            />
          ) : (
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                    <th className="px-5 py-3">Batch ID</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">File</th>
                    <th className="px-5 py-3 text-right">Leads</th>
                    <th className="px-5 py-3 text-right">Called</th>
                    <th className="px-5 py-3 text-right">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                  {batches.map((b) => (
                    <tr key={b.id}>
                      <td className="px-5 py-3 font-mono text-xs text-text-muted">
                        {b.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={batchStatusVariant[b.status] ?? "default"}
                          dot={b.status === "RUNNING"}
                          animate={b.status === "RUNNING"}
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-text-secondary">
                        {b.fileName ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {b.totalLeads}
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {b.calledLeads}
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {b.completedLeads}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
