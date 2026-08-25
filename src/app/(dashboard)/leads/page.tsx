// src/app/(dashboard)/leads/page.tsx

'use client';

import { LeadsTable } from '@/components/leads/LeadsTable';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { useLeads } from '@/hooks/useLeads';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import type { LeadStatus } from '@/types';
import { Search } from 'lucide-react';
import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CALLING', label: 'Calling' },
  { value: 'CALLED', label: 'Called' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'NOT_QUALIFIED', label: 'Not Qualified' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'FAILED', label: 'Failed' },
];

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [campaignId, setCampaignId] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, setPage, reset } = usePagination();

  const { data: campaignsList } = useCampaigns();
  const campaignOptions = [
    { value: '', label: 'All campaigns' },
    ...(campaignsList?.map((c) => ({ value: c.id, label: c.name })) ?? []),
  ];

  const { data, isLoading } = useLeads({
    status: status || undefined,
    campaignId: campaignId || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });



  const handleFilterChange = () => {
    reset();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Leads</h2>
        <p className="text-base text-text-muted mt-0.5">
          All leads across your campaigns
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search leads..."
            leftIcon={<Search size={14} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
          />
        </div>
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as LeadStatus | '');
              handleFilterChange();
            }}
          />
        </div>
        <div className="w-52">
          <Select
            options={campaignOptions}
            value={campaignId}
            onChange={(e) => {
              setCampaignId(e.target.value);
              handleFilterChange();
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <LeadsTable
          leads={data?.leads ?? []}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}