// src/app/(admin)/admin/tenants/page.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTenants, useToggleTenantStatus } from '@/hooks/useTenants';
import { formatDate } from '@/lib/utils/formatDate';
import { Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const { mutate: toggle, isPending } = useToggleTenantStatus();

  console.log("tenants: ", tenants)

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Tenants</h2>
        <p className="text-base text-text-muted mt-0.5">
          All registered organisations
        </p>
      </div>

      {tenants && tenants.length > 0 ? (
        <div className="bg-surface rounded-lg border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle">
                  <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Organisation
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
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Calls
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Created
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
                      <p className="font-medium text-text-primary">{t.name}</p>
                      <p className="text-sm text-text-muted">{t.email}</p>
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
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {t._count.calls}
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
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/tenants/${t.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<ExternalLink size={13} />}
                          >
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant={t.isActive ? 'outline' : 'secondary'}
                          onClick={() =>
                            toggle({ id: t.id, isActive: !t.isActive })
                          }
                          loading={isPending}
                        >
                          {t.isActive ? 'Deactivate' : 'Activate'}
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
          icon={<Building2 size={22} />}
          title="No tenants registered"
          description="Tenants will appear here after registration."
        />
      )}
    </div>
  );
}