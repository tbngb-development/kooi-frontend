"use client";

import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils/formatDate";

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { user, memberships, activeTenantId } = useAuthStore();

  const activeRole = memberships.find(
    (m) => m.tenantId === activeTenantId,
  )?.role;
  const canCreate =
    user?.isPlatformAdmin ||
    (activeRole !== undefined && activeRole !== "USER");

  if (isLoading)
    return (
      <div className="py-12">
        <PageSpinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            Outreach Campaigns
          </h1>
          <p className="text-sm font-medium text-text-muted mt-1">
            Manage, monitor, and create AI-driven calling campaigns.
          </p>
        </div>
        {canCreate && (
          <Link href="/campaigns/new" className="shrink-0">
            <Button
              leftIcon={<Plus size={16} strokeWidth={2.5} />}
              className="w-full sm:w-auto shadow-sm"
            >
              New Campaign
            </Button>
          </Link>
        )}
      </div>

      {/* ─── Campaigns Table ─── */}
      {campaigns && campaigns.length > 0 ? (
        <div className="bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle">
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Campaign
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Assistant
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                    Total Leads
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                    Called
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                    Qualified
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-hover/60 transition-colors duration-normal ease-out"
                  >
                    {/* Campaign Info */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="block group max-w-[240px]"
                      >
                        <p className="text-base font-bold text-text-primary group-hover:text-brand-600 transition-colors truncate">
                          {c.name}
                        </p>
                        {c.description ? (
                          <p className="text-sm font-medium text-text-muted mt-1 truncate">
                            {c.description}
                          </p>
                        ) : (
                          <p className="text-sm italic text-text-placeholder mt-1">
                            No description
                          </p>
                        )}
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <CampaignStatusBadge status={c.status} />
                    </td>

                    {/* Assistant */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-base font-medium text-text-secondary truncate max-w-[150px] inline-block">
                        {c.assistant?.name ?? "Unknown"}
                      </span>
                    </td>

                    {/* Leads (Total) */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="text-base font-bold font-mono text-text-secondary">
                        {c.totalLeads.toLocaleString()}
                      </span>
                    </td>

                    {/* Called */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="text-base font-bold font-mono text-info-600 bg-info-50 px-2 py-0.5 rounded-md border border-info-100">
                        {c.calledLeads.toLocaleString()}
                      </span>
                    </td>

                    {/* Qualified */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="text-base font-bold font-mono text-success-600 bg-success-50 px-2 py-0.5 rounded-md border border-success-100">
                        {c.completedLeads.toLocaleString()}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-text-muted">
                        {formatDate(c.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Target size={28} className="text-text-placeholder" />}
          title="No campaigns yet"
          description="Create your first campaign to start qualifying leads."
          action={
            canCreate ? (
              <Link href="/campaigns/new">
                <Button leftIcon={<Plus size={15} />}>Create Campaign</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
