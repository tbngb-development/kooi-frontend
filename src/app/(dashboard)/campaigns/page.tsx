// src/app/(dashboard)/campaigns/page.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils/formatDate';
import { Plus, Target } from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { user } = useAuthStore();
  const canCreate = user?.role !== 'USER';

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Campaigns</h2>
          <p className="text-base text-text-muted mt-0.5">
            Manage your outreach campaigns
          </p>
        </div>
        {canCreate && (
          <Link href="/campaigns/new">
            <Button leftIcon={<Plus size={15} />}>New Campaign</Button>
          </Link>
        )}
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="bg-surface rounded-lg border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle">
                  <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Campaign
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Assistant
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Leads
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Called
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Qualified
                  </th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <Link href={`/campaigns/${c.id}`} className="block">
                        <p className="font-medium text-text-primary hover:text-brand-600 transition-colors">
                          {c.name}
                        </p>
                        {c.description && (
                          <p className="text-sm text-text-muted mt-0.5 truncate max-w-xs">
                            {c.description}
                          </p>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.assistant.name}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {c.totalLeads}
                    </td>
                    <td className="px-4 py-3 text-right text-info-600 font-medium">
                      {c.calledLeads}
                    </td>
                    <td className="px-4 py-3 text-right text-success-600 font-medium">
                      {c.successLeads}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Target size={22} />}
          title="No campaigns yet"
          description="Create your first campaign to start calling leads."
          action={
            canCreate ? (
              <Link href="/campaigns/new">
                <Button leftIcon={<Plus size={15} />}>
                  Create your first campaign
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}