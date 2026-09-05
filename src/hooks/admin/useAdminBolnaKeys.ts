"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminBolnaKeysApi } from "@/lib/api/admin/admin-bolna-keys";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { CreateBolnaKeyInput } from "@/types/bolna-key";

export function useAdminBolnaKeys() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_BOLNA_KEYS.all,
    queryFn: adminBolnaKeysApi.getAll,
  });
}

export function useCreateBolnaKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBolnaKeyInput) => adminBolnaKeysApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOLNA_KEYS.all });
      toast.success("Bolna API key added successfully");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useAssignBolnaKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId: string }) =>
      adminBolnaKeysApi.assignToTenant(id, tenantId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOLNA_KEYS.all });
      toast.success(data.message ?? "Key assigned to tenant");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}

export function useDeactivateBolnaKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminBolnaKeysApi.deactivate(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOLNA_KEYS.all });
      toast.success(data.message ?? "Key deactivated and tenants reassigned");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
