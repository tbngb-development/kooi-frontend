"use client";

import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useTenants,
  useToggleTenantStatus,
} from "@/hooks/admin/useAdminTenants";
import { formatDate } from "@/lib/utils/formatDate";

export default function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const { mutate: toggle, isPending } = useToggleTenantStatus();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">
          Tenants
        </h2>
        <p className="text-base text-text-muted mt-1">
          Monitor and manage all registered organization workspaces
        </p>
      </div>

      {/* Tenants Table Board */}
      {tenants && tenants.length > 0 ? (
        <div className="bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle">
                  <th className="px-6 py-4 text-base font-bold text-text-muted uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider text-right">
                    Memberships
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider text-right">
                    Campaigns
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider text-right">
                    Leads
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider text-right">
                    Calls
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {tenants.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-surface-hover/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-base font-semibold text-text-primary leading-tight">
                        {t.name}
                      </p>
                      <p className="text-base text-text-placeholder mt-0.5">
                        ID: {t.id}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right text-base text-text-secondary font-medium">
                      {t._count.memberships}
                    </td>
                    <td className="px-4 py-4 text-right text-base text-text-secondary font-medium">
                      {t._count.campaigns}
                    </td>
                    <td className="px-4 py-4 text-right text-base text-text-secondary font-medium">
                      {t._count.leads}
                    </td>
                    <td className="px-4 py-4 text-right text-base text-text-secondary font-medium">
                      {t._count.calls}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {t.isActive ? (
                        <Badge variant="success" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="gray" dot>
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-base text-text-muted">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/tenants/${t.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<ExternalLink size={13} />}
                            className="text-base font-semibold border-surface-border"
                          >
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant={t.isActive ? "outline" : "secondary"}
                          onClick={() =>
                            toggle({ id: t.id, isActive: !t.isActive })
                          }
                          loading={isPending}
                          className="text-base font-semibold"
                        >
                          {t.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Building2 size={24} className="text-text-placeholder" />}
          title="No tenants registered"
          description="Organizations will appear here after registering a new tenant workspace environment."
        />
      )}
    </div>
  );
}
