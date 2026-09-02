"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminPlansApi } from "@/lib/api/admin/admin-plans";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { CreatePlanInput, UpdatePlanInput } from "@/types/plan";

export function useAdminPlans(includeInactive = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_PLANS.all,
    queryFn: () => adminPlansApi.getAll(includeInactive),
  });
}

export function useAdminPlan(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_PLANS.detail(id),
    queryFn: () => adminPlansApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanInput) => adminPlansApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      toast.success("Plan created successfully");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePlanInput) => adminPlansApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.detail(id) });
      toast.success("Plan updated successfully");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
