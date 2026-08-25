// src/app/(dashboard)/campaigns/[id]/leads/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useLeads, useLeadStats } from "@/hooks/useLeads";
import { useCampaign } from "@/hooks/useCampaigns";
import { useDebounce } from "@/hooks/useDebounce";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { FilterBar, FilterSelect, SortSelect } from "@/components/ui/FilterBar";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { ChevronLeft, Users, Search, CheckCircle2, X } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Calling", value: "CALLING" },
  { label: "Called", value: "CALLED" },
  { label: "No Answer", value: "NO_ANSWER" },
  { label: "Failed", value: "FAILED" },
];

const SORT_OPTIONS = [{ label: "Date Added", value: "createdAt" }];

export default function CampaignLeadsPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const campaignId = String(params.id);

  // ─── Read filter state from URL ───
  const page = Number(searchParams.get("page") ?? "1");
  const urlSearch = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc";

  // ─── Local input state ───
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // ─── URL Update Helper ───
  const updateFilter = useCallback(
    (key: string, value: string | number | null) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      if (value === null || value === undefined || value === "") {
        current.delete(key);
      } else if (key === "page" && value === 1) {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }

      if (key !== "page") current.delete("page");

      const query = current.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateFilter("search", debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleReset = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  // ─── Queries ───
  const { data: campaign } = useCampaign(campaignId);
  const { data: leadStats, isLoading: statsLoading } = useLeadStats({
    campaignId,
  });

  const { data, isLoading } = useLeads({
    campaignId,
    page,
    limit: 15,
    search: urlSearch,
    status,
    sortBy,
    sortOrder,
  });

  const hasActiveFilters = Boolean(urlSearch || status || page > 1);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center gap-1.5 text-base text-text-muted hover:text-text-primary mb-3 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Campaign
        </Link>
        <h2 className="text-xl font-bold text-text-primary">
          Leads for {campaign?.name ?? "Campaign"}
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStatCard
          icon={<Users size={15} />}
          label="Total Leads"
          value={leadStats?.total ?? 0}
          color="text-primary-600"
          iconBg="bg-surface-subtle"
          loading={statsLoading}
        />
        <MiniStatCard
          icon={<CheckCircle2 size={15} />}
          label="Qualified Leads"
          value={leadStats?.qualified ?? 0}
          subtitle={leadStats?.qualificationRate}
          color="text-success-600"
          iconBg="bg-success-50"
          loading={statsLoading}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar hasActiveFilters={hasActiveFilters} onReset={handleReset}>
        <div className="w-full md:w-64">
          <Input
            placeholder="Search name or phone..."
            leftIcon={<Search size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <FilterSelect
          label="Status"
          value={status}
          onChange={(val) => updateFilter("status", val)}
          options={STATUS_OPTIONS}
        />
        <div className="ml-auto hidden md:block" />
        <SortSelect
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={(val) => updateFilter("sortBy", val)}
          onSortOrderChange={(val) => updateFilter("sortOrder", val)}
          options={SORT_OPTIONS}
        />
      </FilterBar>

      {/* Leads Table */}
      {isLoading ? (
        <PageSpinner />
      ) : (
        <LeadsTable
          leads={data?.leads ?? []}
          pagination={data?.pagination}
          onPageChange={(p) => updateFilter("page", p)}
        />
      )}
    </div>
  );
}

// ─── Helper Components (Same as Calls) ───

function MiniStatCard({
  icon,
  label,
  value,
  color,
  iconBg,
  loading,
  subtitle,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  iconBg: string;
  loading?: boolean;
  subtitle?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Card
      className={`p-3.5 transition-all ${onClick ? "cursor-pointer hover:border-brand-300 shadow-sm" : ""} ${active ? "border-brand-400 bg-brand-50/20 ring-1 ring-brand-300" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${iconBg} ${color}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          {loading ? (
            <div className="h-6 w-12 rounded bg-surface-subtle animate-pulse" />
          ) : (
            <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
          )}
          <p className="text-[11px] text-text-muted mt-1 font-medium truncate">
            {label}{" "}
            {subtitle && (
              <span className="text-text-muted/80"> · {subtitle}</span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

function FilterBadge({
  icon,
  label,
  onClear,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClear: () => void;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${color}`}
    >
      {icon} Showing {label}
      <button
        type="button"
        onClick={onClear}
        className="ml-0.5 hover:opacity-75 transition-opacity"
      >
        <X size={12} />
      </button>
    </span>
  );
}
