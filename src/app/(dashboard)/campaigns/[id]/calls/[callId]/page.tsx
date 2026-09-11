"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Flame,
  Phone,
  PhoneCall,
  PhoneIncoming,
  Search,
  CheckCircle2,
  X,
  MapPin,
  Thermometer,
  Filter,
  Activity,
  Snowflake,
  Sprout,
} from "lucide-react";

import { useCalls, useCallStats } from "@/hooks/useCalls";
import { useCampaign } from "@/hooks/useCampaigns";
import { useDebounce } from "@/hooks/useDebounce";
import { CallsTable } from "@/components/call-history/CallsTable";
import { FilterBar, FilterSelect, SortSelect } from "@/components/ui/FilterBar";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";

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

const LOCATION_MATCH_OPTIONS = [
  { label: "Match", value: "MATCH" },
  { label: "Mismatch", value: "MISMATCH" },
  { label: "Not Asked", value: "NOT_ASKED" },
  { label: "Not Mentioned", value: "NOT_MENTIONED" },
];

const LOCATION_MATCH_LABELS: Record<string, string> = {
  MATCH: "Location Match",
  MISMATCH: "Location Mismatch",
  NOT_ASKED: "Location Not Asked",
  NOT_MENTIONED: "Location Not Mentioned",
};

// Dynamic maps for chip rendering (fixes WARM missing bug)
const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label]),
);
const DISPOSITION_LABELS = Object.fromEntries(
  DISPOSITION_OPTIONS.map((o) => [o.value, o.label]),
);
const TEMP_LABELS = Object.fromEntries(
  TEMP_OPTIONS.map((o) => [o.value, o.label]),
);

// Temperature chip styles pulled from your CSS variables
const TEMP_CHIP_STYLES: Record<string, string> = {
  HOT: "bg-hot-bg text-hot-text border-hot-border",
  WARM: "bg-warm-bg text-warm-text border-warm-border",
  NURTURE: "bg-info-50 text-info-700 border-info-200",
  COLD: "bg-cold-bg text-cold-text border-cold-border",
};

const TEMP_ICONS: Record<string, React.ReactNode> = {
  HOT: <Flame size={12} />,
  WARM: <Thermometer size={12} />,
  NURTURE: <Sprout size={12} />,
  COLD: <Snowflake size={12} />,
};

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

  // ─── URL State Reads ───
  const page = Number(searchParams.get("page") ?? "1");
  const urlSearch = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const disposition = searchParams.get("disposition") ?? "";
  const leadTemperature = searchParams.get("leadTemperature") ?? "";
  const locationMatch = searchParams.get("locationMatch") ?? "";
  const sortBy =
    (searchParams.get("sortBy") as
      | "startedAt"
      | "duration"
      | "cost"
      | "createdAt") ?? "startedAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc";

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

  const handleQuickFilter = useCallback(
    (key: string, value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const isActive = current.get(key) === value;

      if (isActive) {
        current.delete(key);
      } else {
        current.delete("leadTemperature");
        current.delete("disposition");
        current.set(key, value);
      }

      current.delete("page");

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
  }, [debouncedSearch, urlSearch, updateFilter]);

  const handleReset = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  // ─── Data Queries ───
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
    locationMatch,
    sortBy,
    sortOrder,
  });

  const hasActiveFilters = Boolean(
    urlSearch ||
    status ||
    disposition ||
    leadTemperature ||
    locationMatch ||
    page > 1,
  );

  const callbacksCount =
    callStats?.dispositionBreakdown?.["QUALIFIED_CONSULTANT_FOLLOWUP"] ?? 0;
  const followupsCount =
    callStats?.dispositionBreakdown?.["FOLLOWUP_REQUESTED"] ?? 0;

  // ─── Dynamic Active Filter Chips ───
  // This fixes the WARM (and every other missing) chip bug — chips now render for ANY active filter.
  const activeChips = useMemo(() => {
    const chips: {
      key: string;
      icon: React.ReactNode;
      label: string;
      colorClass: string;
      onClear: () => void;
    }[] = [];

    if (urlSearch) {
      chips.push({
        key: "search",
        icon: <Search size={12} />,
        label: `"${urlSearch}"`,
        colorClass: "bg-neutral-100 text-neutral-700 border-neutral-200",
        onClear: () => {
          setSearchInput("");
          updateFilter("search", null);
        },
      });
    }

    if (status && STATUS_LABELS[status]) {
      chips.push({
        key: "status",
        icon: <Activity size={12} />,
        label: STATUS_LABELS[status],
        colorClass: "bg-accent-50 text-accent-700 border-accent-200",
        onClear: () => updateFilter("status", null),
      });
    }

    if (disposition && DISPOSITION_LABELS[disposition]) {
      chips.push({
        key: "disposition",
        icon: <PhoneCall size={12} />,
        label: DISPOSITION_LABELS[disposition],
        colorClass: "bg-info-50 text-info-700 border-info-200",
        onClear: () => updateFilter("disposition", null),
      });
    }

    if (leadTemperature && TEMP_LABELS[leadTemperature]) {
      chips.push({
        key: "leadTemperature",
        icon: TEMP_ICONS[leadTemperature] ?? <Thermometer size={12} />,
        label: `${TEMP_LABELS[leadTemperature]} Leads`,
        colorClass:
          TEMP_CHIP_STYLES[leadTemperature] ??
          "bg-surface-subtle text-text-muted border-surface-border",
        onClear: () => updateFilter("leadTemperature", null),
      });
    }

    if (locationMatch) {
      chips.push({
        key: "locationMatch",
        icon: <MapPin size={12} />,
        label: LOCATION_MATCH_LABELS[locationMatch] ?? locationMatch,
        colorClass: "bg-secondary-50 text-secondary-700 border-secondary-200",
        onClear: () => updateFilter("locationMatch", null),
      });
    }

    return chips;
  }, [
    urlSearch,
    status,
    disposition,
    leadTemperature,
    locationMatch,
    updateFilter,
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 md:px-0">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/campaigns/${campaignId}`}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors w-fit"
        >
          <ChevronLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to Campaign
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-text-primary">
            Calls for {campaign?.name ?? "Campaign"}
          </h2>
          {callStats?.total != null && !statsLoading && (
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700 border border-brand-100">
              {callStats.total.toLocaleString()} total
            </span>
          )}
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MiniStatCard
          icon={<Phone size={16} />}
          label="Total Calls"
          value={callStats?.total ?? campaign?.calledLeads ?? 0}
          color="text-info-600"
          iconBg="bg-info-50"
          loading={statsLoading}
        />
        <MiniStatCard
          icon={<CheckCircle2 size={16} />}
          label="Qualified"
          value={callStats?.qualifiedCount ?? 0}
          subtitle={callStats?.qualificationRate}
          color="text-success-600"
          iconBg="bg-success-50"
          loading={statsLoading}
        />
        <MiniStatCard
          icon={<Flame size={16} />}
          label="Hot Leads"
          value={callStats?.temperatureBreakdown?.HOT ?? 0}
          color="text-hot-text"
          iconBg="bg-hot-bg"
          loading={statsLoading}
          onClick={() => handleQuickFilter("leadTemperature", "HOT")}
          active={leadTemperature === "HOT"}
        />
        <MiniStatCard
          icon={<PhoneCall size={16} />}
          label="Callbacks"
          value={callbacksCount}
          color="text-accent-600"
          iconBg="bg-accent-50"
          loading={statsLoading}
          onClick={() =>
            handleQuickFilter("disposition", "QUALIFIED_CONSULTANT_FOLLOWUP")
          }
          active={disposition === "QUALIFIED_CONSULTANT_FOLLOWUP"}
        />
        <MiniStatCard
          icon={<PhoneIncoming size={16} />}
          label="Follow-ups"
          value={followupsCount}
          color="text-secondary-600"
          iconBg="bg-secondary-50"
          loading={statsLoading}
          onClick={() => handleQuickFilter("disposition", "FOLLOWUP_REQUESTED")}
          active={disposition === "FOLLOWUP_REQUESTED"}
        />
      </div>

      {/* ─── Filter Bar ─── */}
      <FilterBar hasActiveFilters={hasActiveFilters} onReset={handleReset}>
        <div className="w-full md:w-72">
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
        <FilterSelect
          label="Location"
          value={locationMatch}
          onChange={(val) => updateFilter("locationMatch", val)}
          options={LOCATION_MATCH_OPTIONS}
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

      {/* ─── ✅ FIXED: Active Filter Chips (Now Dynamic) ─── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">
            <Filter size={12} />
            Applied:
          </span>
          {activeChips.map((chip) => (
            <FilterBadge
              key={chip.key}
              icon={chip.icon}
              label={chip.label}
              onClear={chip.onClear}
              color={chip.colorClass}
            />
          ))}
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
          showAttempts={true}
        />
      )}
    </div>
  );
}

// ─── Mini Stat Card ──────────────────────────────────────────────────────────

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
        "p-4 transition-all duration-normal ease-out border",
        clickable
          ? "cursor-pointer hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5"
          : "border-surface-border",
        active
          ? "border-brand-500 bg-brand-50/30 ring-2 ring-brand-500/20 shadow-sm"
          : "",
      ].join(" ")}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${iconBg} ${color} border border-current/10`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="h-6 w-14 rounded bg-surface-subtle animate-pulse-soft" />
          ) : (
            <p className={`text-2xl font-bold leading-none ${color}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          )}
          <p className="text-xs text-text-muted mt-1.5 font-semibold truncate uppercase tracking-wider">
            {label}
            {subtitle ? (
              <span className="text-text-placeholder normal-case font-medium">
                {" "}
                · {subtitle}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── Filter Chip Badge ───────────────────────────────────────────────────────

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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-xs ${color}`}
    >
      {icon}
      <span>{label}</span>
      <button
        type="button"
        onClick={onClear}
        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors focus-ring"
        aria-label={`Clear ${label}`}
      >
        <X size={12} />
      </button>
    </span>
  );
}
