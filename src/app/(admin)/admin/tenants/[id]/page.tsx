// src/app/(admin)/admin/tenants/[id]/page.tsx

"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import GoBackButton from "@/components/ui/GoBackButton";
import { PageSpinner } from "@/components/ui/Spinner";
import { AdminAssistantSection } from "@/components/assistants/AdminAssistantSection";
import {
  useTenant,
  useTenantStats,
  useToggleTenantStatus,
} from "@/hooks/useTenants";
import { formatDate } from "@/lib/utils/formatDate";
import {
  Building2,
  Calendar,
  Copy,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { use, useState } from "react";
import { toast } from "sonner";

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  accent?: "green" | "blue" | "purple" | "orange";
}

const accentClasses = {
  green: {
    icon: "bg-success-50 text-success-600",
    value: "text-success-600",
  },
  blue: {
    icon: "bg-info-50 text-info-600",
    value: "text-info-600",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    value: "text-purple-600",
  },
  orange: {
    icon: "bg-warning-50 text-warning-600",
    value: "text-warning-600",
  },
};

function StatCard({
  label,
  value,
  icon,
  description,
  accent = "green",
}: StatCardProps) {
  const classes = accentClasses[accent];
  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold ${classes.value}`}>{value}</p>
          {description && (
            <p className="text-xs text-text-muted">{description}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${classes.icon}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ── Count Badge Card ──────────────────────────────────────────────────────────

function CountBadgeCard({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-surface-border bg-surface-subtle">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-text-muted border border-surface-border shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{count}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [showApiKey, setShowApiKey] = useState(false);

  const { data: tenant, isLoading: tenantLoading } = useTenant(id);
  const { data: statsData, isLoading: statsLoading } = useTenantStats(id);
  const { mutate: toggle, isPending: toggling } = useToggleTenantStatus();

  const isLoading = tenantLoading || statsLoading;

  if (isLoading) return <PageSpinner />;

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Building2 size={36} className="text-text-muted" />
        <p className="text-base font-semibold text-text-primary">
          Tenant not found
        </p>
        <GoBackButton />
      </div>
    );
  }

  const stats = statsData?.stats;

  const maskedApiKey = tenant.apiKey
    ? `${tenant.apiKey.slice(0, 8)}${"•".repeat(24)}${tenant.apiKey.slice(-4)}`
    : "—";

  function handleCopyApiKey() {
    if (!tenant?.apiKey) return;
    navigator.clipboard.writeText(tenant.apiKey);
    toast.success("API key copied to clipboard");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <GoBackButton />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 shrink-0">
            <Building2 size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-text-primary">
                {tenant.name}
              </h2>
              {tenant.isActive ? (
                <Badge variant="success" dot animate>
                  Active
                </Badge>
              ) : (
                <Badge variant="gray" dot>
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail size={12} className="text-text-muted" />
              <p className="text-sm text-text-muted">{tenant.email}</p>
            </div>
          </div>
        </div>

        <Button
          variant={tenant.isActive ? "danger" : "primary"}
          size="sm"
          loading={toggling}
          onClick={() =>
            toggle({ id: tenant.id, isActive: !tenant.isActive })
          }
        >
          {tenant.isActive ? "Deactivate Tenant" : "Activate Tenant"}
        </Button>
      </div>

      {/* Info Row */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <Calendar size={13} />
          <span>Registered {formatDate(tenant.createdAt)}</span>
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CountBadgeCard
          label="Users"
          count={tenant._count.users}
          icon={<Users size={15} />}
        />
        <CountBadgeCard
          label="Campaigns"
          count={tenant._count.campaigns}
          icon={<Target size={15} />}
        />
        <CountBadgeCard
          label="Leads"
          count={tenant._count.leads}
          icon={<Users size={15} />}
        />
        <CountBadgeCard
          label="Calls"
          count={tenant._count.calls}
          icon={<Phone size={15} />}
        />
      </div>

      {/* Performance Stats */}
      {stats ? (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Performance Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Total Leads"
              value={stats.totalLeads}
              icon={<Users size={18} />}
              description={`${stats.qualifiedLeads} qualified`}
              accent="green"
            />
            <StatCard
              label="Total Calls"
              value={stats.totalCalls}
              icon={<Phone size={18} />}
              description={`${stats.completedCalls} completed`}
              accent="blue"
            />
            <StatCard
              label="Active Campaigns"
              value={stats.activeCampaigns}
              icon={<Target size={18} />}
              accent="purple"
            />
            <StatCard
              label="Qualified Leads"
              value={stats.qualifiedLeads}
              icon={<Users size={18} />}
              accent="green"
            />
            <StatCard
              label="Completed Calls"
              value={stats.completedCalls}
              icon={<Phone size={18} />}
              accent="blue"
            />
            <StatCard
              label="Qualification Rate"
              value={`${stats.qualificationRate.toFixed(1)}%`}
              icon={<TrendingUp size={18} />}
              description="Leads qualified / total leads"
              accent="orange"
            />
          </div>
        </div>
      ) : (
        <Card padding="md">
          <p className="text-sm text-text-muted text-center py-4">
            No performance stats available yet.
          </p>
        </Card>
      )}

      {/* ── Assistant Management Section ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-lg border border-surface-border bg-surface p-5">
        <AdminAssistantSection tenantId={tenant.id} />
      </div>

      {/* API Key */}
      <Card padding="md">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              API Key
            </h3>
            <p className="text-xs text-text-muted">
              Keep this secret — do not share publicly
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-surface-border bg-surface-subtle font-mono text-xs text-text-secondary overflow-hidden">
              <span className="truncate">
                {showApiKey ? tenant.apiKey : maskedApiKey}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKey((v) => !v)}
              leftIcon={showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
            >
              {showApiKey ? "Hide" : "Show"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyApiKey}
              leftIcon={<Copy size={13} />}
            >
              Copy
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}