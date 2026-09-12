"use client";

import { useState } from "react";
import { CallsTable } from "@/components/call-history/CallsTable";
import { FilterBar, FilterSelect } from "@/components/ui/FilterBar";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCalls } from "@/hooks/useCalls";
import { useCampaigns } from "@/hooks/useCampaigns";
import { usePagination } from "@/hooks/usePagination";
import type { CallStatus } from "@/types/call";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CALLING", label: "Calling" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "NO_ANSWER", label: "No Answer" },
];

export default function CallsPage() {
  const [status, setStatus] = useState<CallStatus | "">("");
  const [campaignId, setCampaignId] = useState("");
  const { page, setPage, reset } = usePagination();

  const { data: campaignsList } = useCampaigns();

  const campaignOptions = (campaignsList ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const { data, isLoading } = useCalls({
    status: status || undefined,
    campaignId: campaignId || undefined,
    page,
    limit: 20,
  });

  const hasActiveFilters = Boolean(status || campaignId);

  const handleReset = () => {
    setStatus("");
    setCampaignId("");
    reset();
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          Call History
        </h1>
        <p className="text-sm font-medium text-text-muted mt-1">
          Monitor and review all inbound and outbound call records across your
          workspace.
        </p>
      </div>

      {/* ─── Filter Bar ─── */}
      <FilterBar hasActiveFilters={hasActiveFilters} onReset={handleReset}>
        <FilterSelect
          label="Call Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(val) => {
            setStatus(val as CallStatus | "");
            reset();
          }}
          className="min-w-[160px]"
        />
        <FilterSelect
          label="Campaign Target"
          options={campaignOptions}
          value={campaignId}
          onChange={(val) => {
            setCampaignId(val);
            reset();
          }}
          className="min-w-[200px]"
        />
      </FilterBar>

      {/* ─── Data Table ─── */}
      {isLoading ? (
        <div className="py-12">
          <PageSpinner />
        </div>
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
