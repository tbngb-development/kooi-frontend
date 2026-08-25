// src/app/(dashboard)/calls/page.tsx

'use client';

import { CallsTable } from '@/components/calls/CallsTable';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { useCalls } from '@/hooks/useCalls';
import { useCampaigns } from '@/hooks/useCampaigns';
import { usePagination } from '@/hooks/usePagination';
import type { CallStatus } from '@/types';
import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CALLING', label: 'Calling' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'NO_ANSWER', label: 'No Answer' },
];

export default function CallsPage() {
  const [status, setStatus] = useState<CallStatus | ''>('');
  const [campaignId, setCampaignId] = useState('');
  const { page, setPage, reset } = usePagination();

  const { data: campaignsList } = useCampaigns();
  const campaignOptions = [
    { value: '', label: 'All campaigns' },
    ...(campaignsList?.map((c) => ({ value: c.id, label: c.name })) ?? []),
  ];

  const { data, isLoading } = useCalls({
    status: status || undefined,
    campaignId: campaignId || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Calls</h2>
        <p className="text-base text-text-muted mt-0.5">
          All call records across your campaigns
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CallStatus | '');
              reset();
            }}
          />
        </div>
        <div className="w-52">
          <Select
            options={campaignOptions}
            value={campaignId}
            onChange={(e) => {
              setCampaignId(e.target.value);
              reset();
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <CallsTable
          calls={data?.calls ?? []}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}