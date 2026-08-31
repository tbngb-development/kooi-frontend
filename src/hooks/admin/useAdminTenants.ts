"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminTenantsApi } from "@/lib/api/admin/admin-tenants";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { Tenant } from "@/types/tenant";

/**
 * Platform administrative hooks for cross-tenant management.
 */

export function useTenants() {
  return useQuery({
    queryKey: QUERY_KEYS.TENANTS.all,
    queryFn: adminTenantsApi.adminGetAll,
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TENANTS.detail(id),
    queryFn: () => adminTenantsApi.adminGetById(id),
    enabled: !!id,
  });
}

export function useTenantStats(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TENANTS.stats(id),
    queryFn: () => adminTenantsApi.adminGetStats(id),
    enabled: !!id,
  });
}

export function useToggleTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminTenantsApi.adminUpdate(id, { isActive }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.TENANTS.detail(variables.id),
      });
      toast.success(
        `Tenant ${variables.isActive ? "activated" : "deactivated"} successfully`,
      );
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Tenant, "isActive" | "name">>;
    }) => adminTenantsApi.adminUpdate(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS.all });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.TENANTS.detail(variables.id),
      });
      toast.success("Tenant configuration updated");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
