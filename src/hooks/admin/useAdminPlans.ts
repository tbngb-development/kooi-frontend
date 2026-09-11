"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPlansApi } from "@/lib/api/admin/admin-plans";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { toast } from "sonner";
import type {
  CreatePlanInput,
  UpdatePlanMetaInput,
  CreatePlanVersionInput,
  TenantPlanOverridesInput,
  AdminChangePlanRequest,
} from "@/types/plan";

// ── Queries ──────────────────────────────────────────────────────────────────

export function useAdminPlans(includeInactive = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_PLANS.list(),
    queryFn: () => adminPlansApi.getAll(includeInactive),
  });
}

export function useAdminPlanDetail(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_PLANS.detail(id ?? ""),
    queryFn: () => adminPlansApi.getById(id!),
    enabled: !!id,
  });
}

// ── Plan CRUD Mutations ──────────────────────────────────────────────────────

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanInput) => adminPlansApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      toast.success("Plan created");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useUpdatePlanMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanMetaInput }) =>
      adminPlansApi.updateMeta(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.detail(id) });
      toast.success("Plan metadata updated");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

// ── Version Lifecycle Mutations ──────────────────────────────────────────────

export function useCreatePlanVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      data,
    }: {
      planId: string;
      data: CreatePlanVersionInput;
    }) => adminPlansApi.createVersion(planId, data),
    onSuccess: (_, { planId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.detail(planId) });
      toast.success("Draft version created");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function usePublishPlanVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => adminPlansApi.publishVersion(versionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      toast.success(
        "Version published — new tenants will receive this version",
      );
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useArchivePlanVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => adminPlansApi.archiveVersion(versionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      toast.success("Version archived");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

// ── Enterprise Overrides ─────────────────────────────────────────────────────

export function useUpdateTenantOverrides() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string;
      data: TenantPlanOverridesInput;
    }) => adminPlansApi.updateTenantOverrides(tenantId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
      toast.success("Commercial overrides updated");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useAdminChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string;
      data: AdminChangePlanRequest;
    }) => adminPlansApi.changeTenantPlan(tenantId, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      toast.success(
        `Tenant plan ${data.direction.toLowerCase()}d successfully!`,
      );
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
