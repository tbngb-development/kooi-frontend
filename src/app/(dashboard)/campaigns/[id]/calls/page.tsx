"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter, // ✅ FIX: use App-Router version
} from "next/navigation";
import { useCalls, useCallStats } from "@/hooks/useCalls";
import { useCampaign } from "@/hooks/useCampaigns";
import { useDebounce } from "@/hooks/useDebounce";
import { CallsTable } from "@/components/calls/CallsTable";
import { FilterBar, FilterSelect, SortSelect } from "@/components/ui/FilterBar";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import {
  ChevronLeft,
  Flame,
  Phone,
  PhoneCall,
  PhoneIncoming,
  Search,
  CheckCircle2,
  X,
  PhoneMissed,
} from "lucide-react";
import Link from "next/link";

// ─── Options ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Completed", value: "COMPLETED" },
  { label: "No Answer", value: "NO_ANSWER" },
  { label: "Busy", value: "BUSY" },
  { label: "Failed", value: "FAILED" },
];

const DISPOSITION_OPTIONS = [
  { label: "Consultant Callback", value: "QUALIFIED_CONSULTANT_FOLLOWUP" },
  { label: "Follow-up Requested", value: "FOLLOWUP_REQUESTED" },
  { label: "Language Callback", value: "LANGUAGE_CALLBACK_REQUIRED" },
  { label: "Site Visit Interest", value: "SITE_VISIT_INTEREST" },
  { label: "Send Details", value: "INTERESTED_SEND_DETAILS" },
  { label: "General Interest", value: "INTERESTED_GENERAL" },
  { label: "Not Interested", value: "NOT_INTERESTED" },
  { label: "Do Not Call", value: "DO_NOT_CALL" },
  { label: "Wrong Number", value: "WRONG_NUMBER" },
  { label: "No Response", value: "NO_RESPONSE" },
];

const TEMP_OPTIONS = [
  { label: "Hot", value: "HOT" },
  { label: "Warm", value: "WARM" },
  { label: "Nurture", value: "NURTURE" },
  { label: "Cold", value: "COLD" },
];

const SORT_OPTIONS = [
  { label: "Date", value: "startedAt" },
  { label: "Duration", value: "duration" },
];

export default function CampaignCallsPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const campaignId = String(params.id);

  // ─── Read filter state from URL ───
  const page = Number(searchParams.get("page") ?? "1");
  const urlSearch = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const disposition = searchParams.get("disposition") ?? "";
  const leadTemperature = searchParams.get("leadTemperature") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "startedAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc";

  // ─── Local input state for smooth typing ───
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync input when URL changes externally (e.g. reset)
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

      // Reset to page 1 when any non-page filter changes
      if (key !== "page") {
        current.delete("page");
      }

      const query = current.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, pathname, router],
  );

  // Push debounced search input to URL
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
  const { data: callStats, isLoading: statsLoading } = useCallStats({
    campaignId,
  });

  const { data, isLoading } = useCalls({
    campaignId,
    page,
    limit: 15,
    search: urlSearch,
    status,
    disposition,
    leadTemperature,
    sortBy,
    sortOrder,
  });

  const hasActiveFilters = Boolean(
    urlSearch || status || disposition || leadTemperature || page > 1,
  );

  const callbacksCount =
    callStats?.dispositionBreakdown?.["QUALIFIED_CONSULTANT_FOLLOWUP"] ?? 0;
  const followupsCount =
    callStats?.dispositionBreakdown?.["FOLLOWUP_REQUESTED"] ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Header ─── */}
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center gap-1.5 text-base text-text-muted hover:text-text-primary mb-3 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Campaign
        </Link>
        <h2 className="text-xl font-bold text-text-primary">
          Calls for {campaign?.name ?? "Campaign"}
        </h2>
      </div>

      {/* ─── Stats Cards (URL-synced Quick Filters) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MiniStatCard
          icon={<Phone size={15} />}
          label="Total Calls"
          value={callStats?.total ?? campaign?.calledLeads ?? 0}
          color="text-info-600"
          iconBg="bg-info-50"
          loading={statsLoading}
        />
        <MiniStatCard
          icon={<CheckCircle2 size={15} />}
          label="Qualified Calls"
          value={callStats?.qualifiedCount ?? 0}
          subtitle={callStats?.qualificationRate}
          color="text-success-600"
          iconBg="bg-success-50"
          loading={statsLoading}
        />
        <MiniStatCard
          icon={<Flame size={15} />}
          label="Hot Leads"
          value={callStats?.temperatureBreakdown?.HOT ?? 0}
          color="text-amber-600"
          iconBg="bg-amber-50"
          loading={statsLoading}
          onClick={() =>
            updateFilter(
              "leadTemperature",
              leadTemperature === "HOT" ? null : "HOT",
            )
          }
          active={leadTemperature === "HOT"}
        />
        <MiniStatCard
          icon={<PhoneCall size={15} />}
          label="Consultant Callbacks"
          value={callbacksCount}
          color="text-blue-600"
          iconBg="bg-blue-50"
          loading={statsLoading}
          onClick={() =>
            updateFilter(
              "disposition",
              disposition === "QUALIFIED_CONSULTANT_FOLLOWUP"
                ? null
                : "QUALIFIED_CONSULTANT_FOLLOWUP",
            )
          }
          active={disposition === "QUALIFIED_CONSULTANT_FOLLOWUP"}
        />
        <MiniStatCard
          icon={<PhoneIncoming size={15} />}
          label="Follow-ups Requested"
          value={followupsCount}
          color="text-indigo-600"
          iconBg="bg-indigo-50"
          loading={statsLoading}
          onClick={() =>
            updateFilter(
              "disposition",
              disposition === "FOLLOWUP_REQUESTED"
                ? null
                : "FOLLOWUP_REQUESTED",
            )
          }
          active={disposition === "FOLLOWUP_REQUESTED"}
        />
      </div>

      {/* ─── Filter Bar ─── */}
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
        <FilterSelect
          label="Disposition"
          value={disposition}
          onChange={(val) => updateFilter("disposition", val)}
          options={DISPOSITION_OPTIONS}
        />
        <FilterSelect
          label="Temperature"
          value={leadTemperature}
          onChange={(val) => updateFilter("leadTemperature", val)}
          options={TEMP_OPTIONS}
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

      {/* ─── Active Filter Badges ─── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {status === "NO_ANSWER,BUSY" && (
            <FilterBadge
              icon={<PhoneMissed size={12} />}
              label="No Answer / Busy"
              onClear={() => updateFilter("status", null)}
              color="bg-purple-50 text-purple-700 border-purple-200"
            />
          )}
          {disposition === "QUALIFIED_CONSULTANT_FOLLOWUP" && (
            <FilterBadge
              icon={<PhoneCall size={12} />}
              label="Consultant Callback"
              onClear={() => updateFilter("disposition", null)}
              color="bg-blue-50 text-blue-700 border-blue-200"
            />
          )}
          {disposition === "FOLLOWUP_REQUESTED" && (
            <FilterBadge
              icon={<PhoneIncoming size={12} />}
              label="Follow-up Requested"
              onClear={() => updateFilter("disposition", null)}
              color="bg-indigo-50 text-indigo-700 border-indigo-200"
            />
          )}
          {leadTemperature === "HOT" && (
            <FilterBadge
              icon={<Flame size={12} />}
              label="HOT Leads"
              onClear={() => updateFilter("leadTemperature", null)}
              color="bg-amber-50 text-amber-700 border-amber-200"
            />
          )}
        </div>
      )}

      {/* ─── Calls Table ─── */}
      {isLoading ? (
        <PageSpinner />
      ) : (
        <CallsTable
          calls={data?.calls ?? []}
          pagination={data?.pagination}
          onPageChange={(p) => updateFilter("page", p)}
        />
      )}
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

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
  const clickable = Boolean(onClick);

  return (
    <Card
      className={[
        "p-3.5 transition-all",
        clickable
          ? "cursor-pointer hover:border-brand-300 hover:shadow-sm"
          : "",
        active ? "border-brand-400 bg-brand-50/20 ring-1 ring-brand-300" : "",
      ].join(" ")}
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
            {label}
            {subtitle ? (
              <span className="text-text-muted/80"> · {subtitle}</span>
            ) : null}
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
      {icon}
      Showing {label}
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
