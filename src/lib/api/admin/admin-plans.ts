import apiClient from "@/lib/axios";
import { ADMIN_PLAN_ENDPOINTS } from "@/constants/api-routes/admin/plan-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Plan,
  PlanWithVersions,
  PlanVersion,
  CreatePlanInput,
  UpdatePlanMetaInput,
  CreatePlanVersionInput,
  TenantPlanOverridesInput,
  AdminChangePlanRequest,
  ChangePlanResponse,
} from "@/types/plan";

export const adminPlansApi = {
  // ── Plan CRUD ──────────────────────────────────────────────────────────────

  /** GET /v1/admin/plans?includeInactive=true */
  getAll: async (includeInactive = true): Promise<Plan[]> => {
    const res = await apiClient.get<ApiResponse<Plan[]>>(
      ADMIN_PLAN_ENDPOINTS.LIST,
      { params: { includeInactive } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch plans");
    }
    return res.data.data;
  },

  /** GET /v1/admin/plans/:id — includes `versions` array */
  getById: async (id: string): Promise<PlanWithVersions> => {
    const res = await apiClient.get<ApiResponse<PlanWithVersions>>(
      ADMIN_PLAN_ENDPOINTS.DETAIL(id),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch plan");
    }
    return res.data.data;
  },

  /** POST /v1/admin/plans — creates plan + v1 PlanVersion */
  create: async (data: CreatePlanInput): Promise<Plan> => {
    const res = await apiClient.post<ApiResponse<Plan>>(
      ADMIN_PLAN_ENDPOINTS.CREATE,
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create plan");
    }
    return res.data.data;
  },

  /**
   * PATCH /v1/admin/plans/:id — metadata only.
   * ⚠️ Commercial fields (pricing, limits) are NO LONGER accepted here.
   * Use `createVersion` to change commercial terms.
   */
  updateMeta: async (id: string, data: UpdatePlanMetaInput): Promise<Plan> => {
    const res = await apiClient.patch<ApiResponse<Plan>>(
      ADMIN_PLAN_ENDPOINTS.UPDATE_META(id),
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update plan metadata");
    }
    return res.data.data;
  },

  // ── Version Lifecycle ──────────────────────────────────────────────────────

  /** POST /v1/admin/plans/:planId/versions — creates a DRAFT version */
  createVersion: async (
    planId: string,
    data: CreatePlanVersionInput,
  ): Promise<PlanVersion> => {
    const res = await apiClient.post<ApiResponse<PlanVersion>>(
      ADMIN_PLAN_ENDPOINTS.CREATE_VERSION(planId),
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create plan version");
    }
    return res.data.data;
  },

  /** POST /v1/admin/plans/versions/:versionId/publish */
  publishVersion: async (versionId: string): Promise<PlanVersion> => {
    const res = await apiClient.post<ApiResponse<PlanVersion>>(
      ADMIN_PLAN_ENDPOINTS.PUBLISH_VERSION(versionId),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to publish version");
    }
    return res.data.data;
  },

  /** POST /v1/admin/plans/versions/:versionId/archive */
  archiveVersion: async (versionId: string): Promise<PlanVersion> => {
    const res = await apiClient.post<ApiResponse<PlanVersion>>(
      ADMIN_PLAN_ENDPOINTS.ARCHIVE_VERSION(versionId),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to archive version");
    }
    return res.data.data;
  },

  // ── Enterprise Overrides ───────────────────────────────────────────────────

  /** PATCH /v1/admin/plans/tenants/:tenantId/overrides */
  updateTenantOverrides: async (
    tenantId: string,
    data: TenantPlanOverridesInput,
  ): Promise<void> => {
    const res = await apiClient.patch<ApiResponse<unknown>>(
      ADMIN_PLAN_ENDPOINTS.TENANT_OVERRIDES(tenantId),
      data,
    );
    if (!res.data.success) {
      throw new Error(res.data.error ?? "Failed to update tenant overrides");
    }
  },

  /**
   * POST /v1/admin/plans/tenants/:tenantId/change-plan
   * Admin-initiated plan change. Set `waiveFee: true` to skip the fee difference.
   */
  changeTenantPlan: async (
    tenantId: string,
    data: AdminChangePlanRequest,
  ): Promise<ChangePlanResponse> => {
    const res = await apiClient.post<ApiResponse<ChangePlanResponse>>(
      ADMIN_PLAN_ENDPOINTS.CHANGE_TENANT_PLAN(tenantId),
      data,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to change tenant plan");
    }
    return res.data.data;
  },
};
