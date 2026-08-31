"use client";

import { use, useState } from "react";
import { toast } from "sonner";
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
} from "@/hooks/admin/useAdminTenants";
import { formatDate } from "@/lib/utils/formatDate";

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
    icon: "bg-success-50 text-success-600 border border-success-100",
    value: "text-success-600",
  },
  blue: {
    icon: "bg-info-50 text-info-600 border border-info-100",
    value: "text-info-600",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600 border border-purple-100",
    value: "text-purple-600",
  },
  orange: {
    icon: "bg-warning-50 text-warning-600 border border-warning-100",
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
    <Card padding="md" className="border-surface-border bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-base font-bold text-text-muted uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-2xl font-bold tracking-tight ${classes.value}`}>
            {value}
          </p>
          {description && (
            <p className="text-base text-text-muted mt-0.5">{description}</p>
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
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-text-muted border border-surface-border shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-text-primary leading-tight">
          {count}
        </p>
        <p className="text-base text-text-muted">{label}</p>
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
        <Building2 size={36} className="text-text-placeholder" />
        <p className="text-base font-semibold text-text-primary">
          Tenant Workspace environment not found
        </p>
        <GoBackButton />
      </div>
    );
  }

  const stats = statsData?.stats;

  // Render email and apiKey safely with strict fallbacks
  const tenantEmail = "No contact email configured";
  const rawApiKey = "Api key un-available";
  const maskedApiKey = rawApiKey
    ? `${rawApiKey.slice(0, 8)}${"•".repeat(24)}${rawApiKey.slice(-4)}`
    : "Configuration missing";

  function handleCopyApiKey() {
    if (!rawApiKey) return;
    navigator.clipboard.writeText(rawApiKey);
    toast.success("Platform secret API key copied to clipboard");
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      <div>
        <GoBackButton />
      </div>

      {/* Workspace Environment Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border border-surface-border p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 text-brand-600 shrink-0 shadow-sm">
            <Building2 size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                {tenant.name}
              </h2>
              {tenant.isActive ? (
                <Badge variant="success" dot animate>
                  Active System
                </Badge>
              ) : (
                <Badge variant="gray" dot>
                  Deactivated
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Mail size={13} className="text-text-muted" />
              <p className="text-base text-text-muted">{tenantEmail}</p>
            </div>
          </div>
        </div>

        <Button
          variant={tenant.isActive ? "danger" : "primary"}
          size="sm"
          loading={toggling}
          onClick={() => toggle({ id: tenant.id, isActive: !tenant.isActive })}
          className="shadow-sm font-semibold"
        >
          {tenant.isActive ? "Deactivate Workspace" : "Provision Workspace"}
        </Button>
      </div>

      {/* Info Meta Column */}
      <div className="flex flex-wrap gap-4 pl-1">
        <div className="flex items-center gap-1.5 text-base text-text-muted">
          <Calendar size={13} className="text-text-muted" />
          <span>Provisioned {formatDate(tenant.createdAt)}</span>
        </div>
      </div>

      {/* Core V1 Database Workspace Resource Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CountBadgeCard
          label="Memberships"
          count={tenant._count.memberships}
          icon={<Users size={15} />}
        />
        <CountBadgeCard
          label="Campaigns"
          count={tenant._count.campaigns}
          icon={<Target size={15} />}
        />
        <CountBadgeCard
          label="Leads Loaded"
          count={tenant._count.leads}
          icon={<Users size={15} />}
        />
        <CountBadgeCard
          label="Voice Calls Run"
          count={tenant._count.calls}
          icon={<Phone size={15} />}
        />
      </div>

      {/* Global Campaign Performance Metrics */}
      {stats ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider pl-1">
            Performance & Resource Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Leads Dispatched"
              value={stats.totalLeads}
              icon={<Users size={18} />}
              description={`${stats.qualifiedLeads} qualified successfully`}
              accent="green"
            />
            <StatCard
              label="Connected Interactions"
              value={stats.totalCalls}
              icon={<Phone size={18} />}
              description={`${stats.completedCalls} completed analysis profiles`}
              accent="blue"
            />
            <StatCard
              label="Active Pipeline Campaigns"
              value={stats.activeCampaigns}
              icon={<Target size={18} />}
              accent="purple"
            />
            <StatCard
              label="Identified Qualified Leads"
              value={stats.qualifiedLeads}
              icon={<Users size={18} />}
              accent="green"
            />
            <StatCard
              label="Full Audio Conversions"
              value={stats.completedCalls}
              icon={<Phone size={18} />}
              accent="blue"
            />
            <StatCard
              label="Qualification Ratio"
              value={`${stats.qualificationRate.toFixed(1)}%`}
              icon={<TrendingUp size={18} />}
              description="Confirmed qualified leads / processed base"
              accent="orange"
            />
          </div>
        </div>
      ) : (
        <Card padding="md" className="border-surface-border">
          <p className="text-base text-text-muted text-center py-4">
            Workspace telemetry performance profile unavailable.
          </p>
        </Card>
      )}

      {/* Platform Level Voice Assistant Allocation Manager */}
      <div className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
        <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
          Workspace Virtual Assistants
        </h3>
        <AdminAssistantSection tenantId={tenant.id} />
      </div>

      {/* Secret Tenant Credentials */}
      {rawApiKey && (
        <Card padding="md" className="border-surface-border bg-surface">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  System API Key
                </h3>
                <p className="text-base text-text-muted mt-0.5">
                  Restricted platform secret. Ensure environment security
                  standards.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-surface-border bg-surface-subtle font-mono text-base text-text-secondary overflow-hidden">
                <span className="truncate">
                  {showApiKey ? rawApiKey : maskedApiKey}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey((v) => !v)}
                leftIcon={showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                className="text-base font-semibold text-text-muted hover:text-text-primary"
              >
                {showApiKey ? "Hide Key" : "Reveal"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyApiKey}
                leftIcon={<Copy size={13} />}
                className="text-base font-semibold border-surface-border"
              >
                Copy Key
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
