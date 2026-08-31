"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTenants,
  useToggleTenantStatus,
} from "@/hooks/admin/useAdminTenants";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Input } from "@/components/ui/Input";
import { Search, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";

export default function AdminTenantsPage() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");

  const { data: tenants, isLoading, isFetching } = useTenants();
  const { mutate: toggleStatus, isPending: isToggling } =
    useToggleTenantStatus();

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS.all });
  };

  const filteredTenants = tenants?.filter((t) => {
    const matchesSearch = t.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && t.isActive) ||
      (statusFilter === "suspended" && !t.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Tenant Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Configure system access, activate or suspend organizations, and
            review routing configurations.
          </p>
        </div>
        <div className="shrink-0">
          <RefreshButton onRefresh={handleRefresh} isRefreshing={isFetching} />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search tenant workspaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={14} className="text-text-muted" />}
            className="w-full max-w-md bg-surface border-surface-border text-sm"
          />
        </div>
        <div className="flex border border-surface-border rounded-lg bg-surface p-1 self-start sm:self-auto shrink-0">
          {(["all", "active", "suspended"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                statusFilter === filter
                  ? "bg-error-50 text-error-700 font-bold"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface shadow-sm">
        {isLoading ? (
          <div className="p-16 flex justify-center">
            <Spinner className="text-error-600" />
          </div>
        ) : !filteredTenants || filteredTenants.length === 0 ? (
          <div className="p-16 text-center text-text-muted">
            No organizations found.
          </div>
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                  <th className="px-5 py-3.5">Workspace Instance</th>
                  <th className="px-5 py-3.5">Infrastructure Routing</th>
                  <th className="px-5 py-3.5 text-right">Members</th>
                  <th className="px-5 py-3.5 text-right">Campaigns</th>
                  <th className="px-5 py-3.5 text-right font-mono">Calls</th>
                  <th className="px-5 py-3.5 text-right">Control Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={ADMIN_ROUTES.TENANT_DETAIL(tenant.id)}
                          className="font-bold text-text-primary hover:text-error-600 transition-colors group inline-flex items-center gap-1.5 focus-ring"
                        >
                          <span>{tenant.name}</span>
                          <ExternalLink
                            size={12}
                            className="text-text-placeholder group-hover:text-error-600 transition-colors shrink-0"
                          />
                        </Link>
                      </div>
                      <p className="text-xs text-text-placeholder font-mono truncate mt-0.5 max-w-[200px]">
                        {tenant.id}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={tenant.isActive ? "success" : "error"}
                        className="capitalize"
                      >
                        {tenant.isActive ? "Active Routing" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {tenant._count.memberships}
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {tenant._count.campaigns}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-text-secondary font-semibold">
                      {tenant._count.calls}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          toggleStatus({
                            id: tenant.id,
                            isActive: !tenant.isActive,
                          })
                        }
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all focus-ring cursor-pointer hover:shadow-xs disabled:opacity-50 ${
                          tenant.isActive
                            ? "bg-error-50 border-error-100 text-error-700 hover:bg-error-100/70"
                            : "bg-brand-50 border-brand-100 text-brand-700 hover:bg-brand-100/70"
                        }`}
                      >
                        {tenant.isActive ? (
                          <>
                            <ToggleRight size={14} className="stroke-[2.5]" />
                            <span>Suspend Tenant</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={14} className="stroke-[2.5]" />
                            <span>Activate Tenant</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
