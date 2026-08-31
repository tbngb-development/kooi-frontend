"use client";

import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import { useAdminCampaigns } from "@/hooks/admin/useAdminCampaigns";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar, FilterSelect } from "@/components/ui/FilterBar";
import { Input } from "@/components/ui/Input";
import { Megaphone, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

const statusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Running", value: "RUNNING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

const statusVariant: Record<string, "gray" | "info" | "success" | "error"> = {
  DRAFT: "gray",
  RUNNING: "info",
  COMPLETED: "success",
  FAILED: "error",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenantCampaignsPage({ params }: PageProps) {
  const { id: tenantId } = use(params);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data: tenant } = useTenant(tenantId);
  const {
    data: campaigns,
    isLoading,
    isFetching,
  } = useAdminCampaigns(tenantId);

  const filtered = campaigns?.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !status || c.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title="Campaigns"
          description={`All campaigns for ${tenant?.name ?? "tenant"}`}
          backHref={ADMIN_ROUTES.TENANT_DETAIL(tenantId)}
          onRefresh={() =>
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS.all(tenantId),
            })
          }
          isRefreshing={isFetching}
        />

        <FilterBar
          hasActiveFilters={!!status || !!search}
          onReset={() => {
            setStatus("");
            setSearch("");
          }}
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={14} className="text-text-muted" />}
              className="w-56 h-8 text-sm"
            />
          </div>
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />
        </FilterBar>

        <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Spinner className="text-error-600" />
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <EmptyState
              icon={<Megaphone size={24} />}
              title="No campaigns found"
              description="This tenant has no campaigns matching your filters."
            />
          ) : (
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                    <th className="px-5 py-3">Campaign</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Leads</th>
                    <th className="px-5 py-3 text-right">Called</th>
                    <th className="px-5 py-3 text-right">Completed</th>
                    <th className="px-5 py-3 text-right">Failed</th>
                    <th className="px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={ADMIN_ROUTES.TENANT_CAMPAIGN_DETAIL(
                            tenantId,
                            c.id,
                          )}
                          className="font-semibold text-text-primary hover:text-error-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          {c.name}
                          <ExternalLink
                            size={12}
                            className="text-text-placeholder"
                          />
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={statusVariant[c.status] ?? "default"}
                          dot={c.status === "RUNNING"}
                          animate={c.status === "RUNNING"}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {c.totalLeads}
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {c.calledLeads}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-success-600">
                        {c.completedLeads}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-error-600">
                        {c.failedLeads}
                      </td>
                      <td className="px-5 py-4 text-xs text-text-muted">
                        {new Date(c.createdAt).toLocaleDateString()}
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
