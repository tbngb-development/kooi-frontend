// Tenant Dashboard API types
// All money values are integer paisa (divide by 100 for ₹)
// All percentages are numbers (0–100)
// All dates are ISO 8601 strings

// ─── Shared enums (string unions, backend-owned) ──────────────────────────────
export type Granularity = "daily" | "weekly" | "monthly";
export type TopCampaignsMetric =
  | "qualified_leads"
  | "total_calls"
  | "total_spend";

export type LeadTemperature = "HOT" | "WARM" | "COLD" | "NURTURE";

// ─── Common query params ──────────────────────────────────────────────────────
export interface DashboardDateRange {
  dateFrom?: string; // ISO date (YYYY-MM-DD)
  dateTo?: string;
}

export interface DashboardFilters extends DashboardDateRange {
  campaignId?: string;
}

export interface DashboardTimeSeriesFilters extends DashboardFilters {
  granularity?: Granularity;
}

export interface TopCampaignsFilters extends DashboardFilters {
  metric?: TopCampaignsMetric;
  limit?: number;
}
// ─── 1. Overview ──────────────────────────────────────────────────────────────
export interface DashboardOverview {
  campaigns: {
    total: number;
    active: number;
  };
  leads: {
    total: number;
    qualified: number;
    notQualified: number;
    qualificationRate: number;
  };
  calls: {
    total: number;
    completed: number;
    failed: number;
    noAnswer: number;
  };
  spend: {
    totalPaisa: number;
    avgCostPerQualifiedLeadPaisa: number;
  };
}

// ─── 2. Call Trends ───────────────────────────────────────────────────────────
export interface CallTrendPoint {
  date: string;
  total: number;
  completed: number;
  failed: number;
  noAnswer: number;
}

export interface DashboardCallTrends {
  granularity: Granularity;
  data: CallTrendPoint[];
}

// ─── 3. Spend Trends ──────────────────────────────────────────────────────────
export interface SpendTrendPoint {
  date: string;
  cashSpentPaisa: number;
  bonusSpentPaisa: number;
  totalSpentPaisa: number;
}

export interface DashboardSpendTrends {
  granularity: Granularity;
  data: SpendTrendPoint[];
}

// ─── 4. Lead Funnel ───────────────────────────────────────────────────────────
export interface DashboardLeadFunnel {
  totalLeads: number;
  calledLeads: number;
  completedLeads: number;
  qualifiedLeads: number;
  rates: {
    callRate: number;
    completionRate: number;
    qualificationRate: number;
  };
}

// ─── 5. Disposition Breakdown ─────────────────────────────────────────────────
export interface DispositionSlice {
  disposition: string;
  count: number;
  percentage: number;
}

export interface DashboardDispositionBreakdown {
  total: number;
  data: DispositionSlice[];
}

// ─── 6. Temperature Distribution ──────────────────────────────────────────────
export interface TemperatureSlice {
  temperature: LeadTemperature;
  count: number;
  percentage: number;
}

export interface DashboardTemperatureDistribution {
  total: number;
  data: TemperatureSlice[];
}

// ─── 7. Campaign Performance ──────────────────────────────────────────────────
export interface CampaignPerformanceRow {
  id: string;
  name: string;
  status: string;
  assistantName: string;
  totalLeads: number;
  calledLeads: number;
  completedLeads: number;
  failedLeads: number;
  qualifiedLeads: number;
  completionRate: number;
  qualificationRate: number;
  totalSpendPaisa: number;
  avgCostPerLeadPaisa: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface DashboardCampaignPerformance {
  total: number;
  data: CampaignPerformanceRow[];
}

// ─── 8. Top Campaigns ─────────────────────────────────────────────────────────
export interface TopCampaignItem {
  id: string;
  name: string;
  value: number;
}

export interface DashboardTopCampaigns {
  metric: TopCampaignsMetric;
  data: TopCampaignItem[];
}

// ─── 9. Recent Activity ───────────────────────────────────────────────────────
export interface RecentCallItem {
  id: string;
  bolnaCallId: string | null;
  status: string;
  duration: number | null;
  chargedAmountPaisa: number | null;
  startedAt: string | null;
  createdAt: string;
  lead: { name: string | null; phone: string } | null;
  campaign: { name: string } | null;
  callAnalysis: {
    disposition: string | null;
    leadTemperature: string | null;
  } | null;
}

export interface QualifiedLeadItem {
  leadId: string;
  name: string | null;
  phone: string;
  campaign: string;
  disposition: string | null;
  leadTemperature: string | null;
  qualifiedAt: string;
}

export interface DashboardRecentActivity {
  recentCalls: RecentCallItem[];
  qualifiedLeads: QualifiedLeadItem[];
}
