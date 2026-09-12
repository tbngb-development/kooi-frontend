// Admin Dashboard API types
// ─── Shared types ─────────────────────────────────────────────────────────────
export type AdminGranularity = "daily" | "weekly" | "monthly";

export type AdminTopTenantsMetric = "total_spend" | "call_volume" | "revenue";

export type AdminEngagementLevel = "HIGH" | "MEDIUM" | "LOW";

export type AdminActivityType =
  | "TENANT_REGISTERED"
  | "CAMPAIGN_STARTED"
  | "CAMPAIGN_COMPLETED"
  | "BATCH_COMPLETED"
  | "RECHARGE_SUCCESS"
  | "CALL_MILESTONE";

export type AdminRiskReason =
  | "NO_CALLS_14_DAYS"
  | "LOW_WALLET_BALANCE"
  | "NO_ACTIVE_CAMPAIGNS";

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface AdminDateRange {
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminTimeSeriesFilters extends AdminDateRange {
  granularity?: AdminGranularity;
}

export interface AdminTopTenantsFilters extends AdminDateRange {
  metric?: AdminTopTenantsMetric;
  limit?: number;
}

export interface AdminActivityFilters {
  limit?: number;
}

// ─── 1. Overview ──────────────────────────────────────────────────────────────
export interface AdminOverview {
  tenants: { total: number; active: number; newInPeriod: number };
  users: {
    total: number;
    active: number;
    newInPeriod: number;
  };
  revenue: {
    totalPaisa: number;
    avgPerTenantPaisa: number;
    rechargeCount: number;
  };
  calls: {
    total: number;
    completed: number;
    failed: number;
    totalDurationMinutes: number;
  };
  campaigns: { total: number; active: number };
}

// ─── 2. Revenue Trends ────────────────────────────────────────────────────────
export interface RevenueTrendPoint {
  date: string;
  totalRevenuePaisa: number;
  rechargeCount: number;
  avgRechargePaisa: number;
}

export interface AdminRevenueTrends {
  granularity: AdminGranularity;
  data: RevenueTrendPoint[];
}

// ─── 3. Call Volume Trends ────────────────────────────────────────────────────
export interface CallVolumeTrendPoint {
  date: string;
  total: number;
  completed: number;
  failed: number;
  noAnswer: number;
}

export interface AdminCallVolumeTrends {
  granularity: AdminGranularity;
  data: CallVolumeTrendPoint[];
}

// ─── 4. Tenant Distribution ───────────────────────────────────────────────────
export interface TenantDistributionSlice {
  planName: string;
  planSlug: string;
  tenantCount: number;
  percentage: number;
}

export interface AdminTenantDistribution {
  total: number;
  data: TenantDistributionSlice[];
}

// ─── 5. Top Tenants ───────────────────────────────────────────────────────────
export interface TopTenantItem {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  value: number;
}

export interface AdminTopTenants {
  metric: AdminTopTenantsMetric;
  data: TopTenantItem[];
}

// ─── 8. Activity Feed ─────────────────────────────────────────────────────────
export interface AdminActivityItem {
  id: string;
  tenantId: string;
  tenantName: string;
  type: AdminActivityType;
  message: string;
  timestamp: string;
}
