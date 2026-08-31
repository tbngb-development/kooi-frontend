"use client";

import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import { useAdminLeads } from "@/hooks/admin/useAdminLeads";
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
import { Input } from "@/components/ui/Input";
import { Users, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

const statusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Calling", value: "CALLING" },
  { label: "Called", value: "CALLED" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Not Qualified", value: "NOT_QUALIFIED" },
  { label: "No Answer", value: "NO_ANSWER" },
  { label: "Failed", value: "FAILED" },
];

const statusVariant: Record<
  string,
  "gray" | "info" | "blue" | "success" | "warning" | "default" | "error"
> = {
  PENDING: "gray",
  CALLING: "info",
  CALLED: "blue",
  QUALIFIED: "success",
  NOT_QUALIFIED: "warning",
  NO_ANSWER: "default",
  FAILED: "error",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenantLeadsPage({ params }: PageProps) {
  const { id: tenantId } = use(params);
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data: tenant } = useTenant(tenantId);
  const { data, isLoading, isFetching } = useAdminLeads({
    tenantId,
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
  });

  const leads = data?.leads ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title="Leads"
          description={
            pagination ? `${pagination.total} total leads` : undefined
          }
          backHref={ADMIN_ROUTES.TENANT_DETAIL(tenantId)}
          onRefresh={() =>
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.ADMIN_LEADS.all(tenantId),
            })
          }
          isRefreshing={isFetching}
        />

        <FilterBar
          hasActiveFilters={!!status || !!search}
          onReset={() => {
            setStatus("");
            setSearch("");
            setPage(1);
          }}
        >
          <Input
            type="text"
            placeholder="Search name, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search size={14} className="text-text-muted" />}
            className="w-56 h-8 text-sm"
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={statusOptions}
          />
        </FilterBar>

        <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Spinner className="text-error-600" />
            </div>
          ) : leads.length === 0 ? (
            <EmptyState icon={<Users size={24} />} title="No leads found" />
          ) : (
            <>
              <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                      <th className="px-5 py-3">Lead</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">DNC</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-surface-muted/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={ADMIN_ROUTES.TENANT_LEAD_DETAIL(
                              tenantId,
                              lead.id,
                            )}
                            className="font-semibold hover:text-error-600 transition-colors inline-flex items-center gap-1.5"
                          >
                            {lead.name ?? "Unknown"}
                            <ExternalLink
                              size={12}
                              className="text-text-placeholder"
                            />
                          </Link>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-text-secondary">
                          {lead.phone}
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            variant={statusVariant[lead.status] ?? "default"}
                            dot={lead.status === "CALLING"}
                            animate={lead.status === "CALLING"}
                          >
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          {lead.doNotCall && <Badge variant="error">DNC</Badge>}
                        </td>
                        <td className="px-5 py-4 text-xs text-text-muted">
                          {new Date(lead.createdAt).toLocaleDateString()}
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
