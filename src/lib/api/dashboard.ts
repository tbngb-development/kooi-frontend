import apiClient from "@/lib/axios";
import { DASHBOARD_ENDPOINTS } from "@/constants/api-routes/dashboard-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  DashboardCallTrends,
  DashboardCampaignPerformance,
  DashboardDispositionBreakdown,
  DashboardFilters,
  DashboardLeadFunnel,
  DashboardOverview,
  DashboardRecentActivity,
  DashboardSpendTrends,
  DashboardTemperatureDistribution,
  DashboardTimeSeriesFilters,
  DashboardTopCampaigns,
  TopCampaignsFilters,
} from "@/types/dashboard";

type CleanableValue = string | number | boolean;

/**
 * Strips undefined, null, and empty string keys from an object.
 */
function cleanParams<T extends object>(
  params?: T,
): Record<string, CleanableValue> | undefined {
  if (!params) return undefined;

  const out: Record<string, CleanableValue> = {};
  const entries = Object.entries(params as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean")
    ) {
      out[key] = value;
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Generic data fetcher with strict return types and parameterized inputs.
 */
async function fetchData<TData, TParams extends object = object>(
  url: string,
  params?: TParams,
): Promise<TData> {
  const res = await apiClient.get<ApiResponse<TData>>(url, {
    params: cleanParams(params),
  });

  if (!res.data.success || res.data.data === undefined) {
    throw new Error(res.data.error ?? "Request failed");
  }

  return res.data.data;
}

/**
 * Builds a query-string URL for direct download endpoints.
 */
function buildUrl<TParams extends object = object>(
  path: string,
  params?: TParams,
): string {
  const cleaned = cleanParams(params);
  if (!cleaned) return path;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(cleaned)) {
    search.append(key, String(value));
  }

  return `${path}?${search.toString()}`;
}

/**
 * Tenant Analytics Dashboard API client.
 * Backend module: `modules/dashboard` (tenant routes).
 */
export const dashboardApi = {
  getOverview: (filters?: DashboardFilters) =>
    fetchData<DashboardOverview, DashboardFilters>(
      DASHBOARD_ENDPOINTS.OVERVIEW,
      filters,
    ),

  getCallTrends: (filters?: DashboardTimeSeriesFilters) =>
    fetchData<DashboardCallTrends, DashboardTimeSeriesFilters>(
      DASHBOARD_ENDPOINTS.CALL_TRENDS,
      filters,
    ),

  getSpendTrends: (filters?: DashboardTimeSeriesFilters) =>
    fetchData<DashboardSpendTrends, DashboardTimeSeriesFilters>(
      DASHBOARD_ENDPOINTS.SPEND_TRENDS,
      filters,
    ),

  getLeadFunnel: (filters?: DashboardFilters) =>
    fetchData<DashboardLeadFunnel, DashboardFilters>(
      DASHBOARD_ENDPOINTS.LEAD_FUNNEL,
      filters,
    ),

  getDispositionBreakdown: (filters?: DashboardFilters) =>
    fetchData<DashboardDispositionBreakdown, DashboardFilters>(
      DASHBOARD_ENDPOINTS.DISPOSITION_BREAKDOWN,
      filters,
    ),

  getTemperatureDistribution: (filters?: DashboardFilters) =>
    fetchData<DashboardTemperatureDistribution, DashboardFilters>(
      DASHBOARD_ENDPOINTS.TEMPERATURE_DISTRIBUTION,
      filters,
    ),

  getCampaignPerformance: (filters?: DashboardFilters) =>
    fetchData<DashboardCampaignPerformance, DashboardFilters>(
      DASHBOARD_ENDPOINTS.CAMPAIGN_PERFORMANCE,
      filters,
    ),

  getTopCampaigns: (filters?: TopCampaignsFilters) =>
    fetchData<DashboardTopCampaigns, TopCampaignsFilters>(
      DASHBOARD_ENDPOINTS.TOP_CAMPAIGNS,
      filters,
    ),

  getRecentActivity: () =>
    fetchData<DashboardRecentActivity>(DASHBOARD_ENDPOINTS.RECENT_ACTIVITY),

  /**
   * Build URLs for CSV downloads.
   */
  buildExportCampaignPerformanceUrl: (filters?: DashboardFilters) =>
    buildUrl<DashboardFilters>(
      DASHBOARD_ENDPOINTS.EXPORT_CAMPAIGN_PERFORMANCE,
      filters,
    ),

  buildExportCallTrendsUrl: (filters?: DashboardTimeSeriesFilters) =>
    buildUrl<DashboardTimeSeriesFilters>(
      DASHBOARD_ENDPOINTS.EXPORT_CALL_TRENDS,
      filters,
    ),
};
