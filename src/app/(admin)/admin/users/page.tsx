"use client";

import { useState } from "react";
import {
  useAdminUsers,
  useDeactivateAdminUser,
} from "@/hooks/admin/useAdminUsers";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Input } from "@/components/ui/Input";
import { Users2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import type { AdminUser } from "@/types/user";

export default function AdminUsersDirectoryPage() {
  const [searchVal, setSearchVal] = useState("");
  const debouncedSearch = useDebounce(searchVal, 300);

  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const {
    data: userPage,
    isLoading,
    isFetching,
    refetch,
  } = useAdminUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const stateMutation = useDeactivateAdminUser();

  const getTenantsList = (user: AdminUser) => {
    // Safely handles user.tenants, user.memberships, or undefined
    const rawTenants =
      user.tenants ??
      (user as unknown as { memberships?: Array<Record<string, unknown>> })
        .memberships ??
      [];

    return rawTenants.map((ten: any) => ({
      tenantId:
        ten.tenantId ?? ten.tenant?.id ?? ten.id ?? String(Math.random()),
      tenantName: ten.tenantName ?? ten.tenant?.name ?? ten.name ?? "Workspace",
      role: ten.role ?? "MEMBER",
    }));
  };

  const userItems = userPage?.items ?? [];

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            User Directory
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Cross-tenant profile tracking and central access directory control.
          </p>
        </div>
        <div className="flex items-center shrink-0">
          <RefreshButton onRefresh={refetch} isRefreshing={isFetching} />
        </div>
      </div>

      {/* Filter Row */}
      <Card className="p-3 border border-surface-border">
        <Input
          placeholder="Search administrators by full name or email address..."
          leftIcon={<Search size={15} />}
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      {/* Catalog Grid */}
      <Card className="overflow-hidden border border-surface-border bg-surface rounded-xl">
        {isLoading && page === 1 ? (
          <div className="p-12 flex justify-center">
            <Spinner className="text-error-600" />
          </div>
        ) : userItems.length === 0 ? (
          <EmptyState
            icon={<Users2 size={24} />}
            title="No users resolved"
            description="Your search filters yielded zero administrative profiles registered across any tenants."
          />
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                  <th className="px-5 py-3">User Identity</th>
                  <th className="px-5 py-3">Tenant mappings</th>
                  <th className="px-5 py-3">Joined On</th>
                  <th className="px-5 py-3">Access State</th>
                  <th className="px-5 py-3 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                {userItems.map((user) => {
                  const tenantList = getTenantsList(user);
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-text-primary">
                          {user.name ?? "Unnamed"}
                        </p>
                        <p className="text-xs text-text-muted font-semibold">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {tenantList.length === 0 ? (
                            <span className="text-xs text-text-placeholder font-semibold">
                              No workspaces joined
                            </span>
                          ) : (
                            tenantList.map((ten) => (
                              <Badge
                                key={ten.tenantId}
                                variant="gray"
                                className="text-[10px] font-bold"
                              >
                                {ten.tenantName} ({ten.role})
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-text-secondary">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={user.isActive ? "success" : "error"}
                          dot
                        >
                          {user.isActive ? "Granted Access" : "Deactivated"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            stateMutation.mutate({
                              id: user.id,
                              isActive: !user.isActive,
                            })
                          }
                          disabled={stateMutation.isPending}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 ${
                            user.isActive
                              ? "border-error-100 bg-error-50 text-error-700 hover:bg-error-100"
                              : "border-brand-100 bg-brand-50 text-brand-700 hover:bg-brand-100"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <ToggleRight size={14} /> Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={14} /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {userPage && userPage.total > limit && (
              <div className="p-4 border-t border-surface-border">
                <Pagination
                  page={page}
                  totalPages={Math.ceil(userPage.total / limit)}
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
