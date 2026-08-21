// src/app/(dashboard)/campaigns/[id]/calls/page.tsx

"use client";

import { CallsTable } from "@/components/calls/CallsTable";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCalls } from "@/hooks/useCalls";
import { usePagination } from "@/hooks/usePagination";
import { ChevronLeft, Flame, X } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function CampaignCallsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = String(params.id);
  const { page, setPage } = usePagination();

  const leadTemperature = searchParams.get("leadTemperature") ?? undefined;

  const { data, isLoading } = useCalls({
    campaignId,
    leadTemperature,
    page,
    limit: 20,
  });

  const clearFilter = () => {
    router.push(`/campaigns/${campaignId}/calls`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-3 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Campaign
        </Link>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-text-primary">
            {leadTemperature ? "Qualified Calls" : "Campaign Calls"}
          </h2>

          {leadTemperature && (
            <button
              onClick={clearFilter}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Flame size={11} />
              Filter: {leadTemperature}
              <X size={11} />
            </button>
          )}
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
