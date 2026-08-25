// src/app/(admin)/admin/dashboard/page.tsx

'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTenants, useToggleTenantStatus } from '@/hooks/useTenants';
import { formatDate } from '@/lib/utils/formatDate';
import { Building2, Phone, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: tenants, isLoading } = useTenants();
  const { mutate: toggle, isPending: toggling } = useToggleTenantStatus();

  console.log("tenants: ", tenants)

  if (isLoading) return <PageSpinner />;

  const activeTenants = tenants?.filter((t) => t.isActive).length ?? 0;
  const totalLeads = tenants?.reduce((a, t) => a + t._count.leads, 0) ?? 0;
  const totalCalls = tenants?.reduce((a, t) => a + t._count.calls, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tenants"
          value={tenants?.length ?? 0}
          subtitle={`${activeTenants} active`}
          icon={<Building2 size={18} />}
          iconColor="bg-brand-100 text-brand-600"
        />
        <StatsCard
          title="Active Tenants"
          value={activeTenants}
          icon={<Building2 size={18} />}
          iconColor="bg-success-100 text-success-600"
        />
        <StatsCard
          title="Total Leads"
          value={totalLeads}
          subtitle="Across all tenants"
          icon={<Users size={18} />}
          iconColor="bg-info-100 text-info-600"
        />
        <StatsCard
          title="Total Calls"
          value={totalCalls}
          subtitle="Across all tenants"
          icon={<Phone size={18} />}
          iconColor="bg-secondary-50 text-secondary-600"
        />
      </div>

      {/* Tenants Table */}
      <div className="bg-surface rounded-lg border border-surface-border overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-base font-semibold text-text-primary">
            All Tenants
          </h3>
        </div>
        {tenants && tenants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle">
                  <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Tenant
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Users
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Campaigns
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Leads
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Joined
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {tenants.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/tenants/${t.id}`}
                        className="font-medium text-text-primary hover:text-brand-600 transition-colors"
                      >
                        {t.name}
                      </Link>
                      <p className="text-sm text-text-muted mt-0.5">
                        {t.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {t._count.users}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {t._count.campaigns}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {t._count.leads}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-text-muted text-sm">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="sm"
                        variant={t.isActive ? 'outline' : 'secondary'}
                        onClick={() =>
                          toggle({ id: t.id, isActive: !t.isActive })
                        }
                        loading={toggling}
                      >
                        {t.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Building2 size={22} />}
            title="No tenants yet"
            description="Tenants will appear here after they register."
          />
        )}
      </div>
    </div>
  );
}