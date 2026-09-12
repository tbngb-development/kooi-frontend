import apiClient from "@/lib/axios";
import { DASHBOARD_ENDPOINTS } from "@/constants/api-routes/dashboard-endpoint";
import { cleanParams } from "@/lib/utils/cleanParams";
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

/**
 * Builds a query-string URL for direct download actions.
 */
function buildUrl<TParams extends object>(
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

export const dashboardApi = {
  getOverview: async (
    filters?: DashboardFilters,
  ): Promise<DashboardOverview> => {
    const res = await apiClient.get<ApiResponse<DashboardOverview>>(
      DASHBOARD_ENDPOINTS.OVERVIEW,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(res.data.error ?? "Failed to fetch dashboard overview");
    }
    return res.data.data;
  },

  getCallTrends: async (
    filters?: DashboardTimeSeriesFilters,
  ): Promise<DashboardCallTrends> => {
    const res = await apiClient.get<ApiResponse<DashboardCallTrends>>(
      DASHBOARD_ENDPOINTS.CALL_TRENDS,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(res.data.error ?? "Failed to fetch call trends");
    }
    return res.data.data;
  },

  getSpendTrends: async (
    filters?: DashboardTimeSeriesFilters,
  ): Promise<DashboardSpendTrends> => {
    const res = await apiClient.get<ApiResponse<DashboardSpendTrends>>(
      DASHBOARD_ENDPOINTS.SPEND_TRENDS,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(res.data.error ?? "Failed to fetch spend trends");
    }
    return res.data.data;
  },

  getLeadFunnel: async (
    filters?: DashboardFilters,
  ): Promise<DashboardLeadFunnel> => {
    const res = await apiClient.get<ApiResponse<DashboardLeadFunnel>>(
      DASHBOARD_ENDPOINTS.LEAD_FUNNEL,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(res.data.error ?? "Failed to fetch lead funnel");
    }
    return res.data.data;
  },

  getDispositionBreakdown: async (
    filters?: DashboardFilters,
  ): Promise<DashboardDispositionBreakdown> => {
    const res = await apiClient.get<ApiResponse<DashboardDispositionBreakdown>>(
      DASHBOARD_ENDPOINTS.DISPOSITION_BREAKDOWN,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(
        res.data.error ?? "Failed to fetch disposition breakdown",
      );
    }
    return res.data.data;
  },

  getTemperatureDistribution: async (
    filters?: DashboardFilters,
  ): Promise<DashboardTemperatureDistribution> => {
    const res = await apiClient.get<
      ApiResponse<DashboardTemperatureDistribution>
    >(DASHBOARD_ENDPOINTS.TEMPERATURE_DISTRIBUTION, {
      params: cleanParams(filters),
    });
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(
        res.data.error ?? "Failed to fetch temperature distribution",
      );
    }
    return res.data.data;
  },

  getTopCampaigns: async (
    filters?: TopCampaignsFilters,
  ): Promise<DashboardTopCampaigns> => {
    const res = await apiClient.get<ApiResponse<DashboardTopCampaigns>>(
      DASHBOARD_ENDPOINTS.TOP_CAMPAIGNS,
      { params: cleanParams(filters) },
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(res.data.error ?? "Failed to fetch top campaigns");
    }
    return res.data.data;
  },

  getRecentActivity: async (): Promise<DashboardRecentActivity> => {
    const res = await apiClient.get<ApiResponse<DashboardRecentActivity>>(
      DASHBOARD_ENDPOINTS.RECENT_ACTIVITY,
    );
    if (!res.data.success || res.data.data === undefined) {
      throw new Error(res.data.error ?? "Failed to fetch recent activity");
    }
    return res.data.data;
  },
};
