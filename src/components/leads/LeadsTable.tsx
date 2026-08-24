// src/components/leads/LeadsTable.tsx

'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { LeadStatusBadge } from './LeadStatusBadge';
import { formatDate } from '@/lib/utils/formatDate';
import type { Lead, PaginationMeta } from '@/types';
import { Users } from 'lucide-react';
import Link from 'next/link';

interface LeadsTableProps {
  leads: Lead[];
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function LeadsTable({
  leads,
  pagination,
  onPageChange,
}: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={<Users size={22} />}
        title="No leads found"
        description="Upload a CSV to add leads to this campaign."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface rounded-lg border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle">
                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Company
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Campaign
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-surface-hover transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-text-primary hover:text-brand-600 transition-colors"
                    >
                      {lead.name}
                    </Link>
                    {lead.email && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {lead.email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                    {lead.phone}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {lead.company ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/campaigns/${lead.campaignId}`}
                      className="text-text-muted hover:text-brand-600 text-xs transition-colors"
                    >
                      {lead.campaign.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-text-muted text-xs">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Showing {leads.length} of {pagination.total} leads
          </p>
          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}